// Imports
// =============================================================================

const { promisify } = require('util');

// Main
// =============================================================================

module.exports = ({ fs, git, gitInternals, dir = '.' }) => {
  // Utils
  // ---------------------------------------------------------------------------
  const getTreeContainedOids = async oid => {
    const treeHolder = await git.readTree({
      dir,
      oid,
    });
    const trees = treeHolder.tree.filter(o => o.type === 'tree');
    const notTrees = treeHolder.tree.filter(o => o.type !== 'tree');

    const oids = [oid, ...notTrees.map(o => o.oid)];
    for (const tree of trees)
      oids.push(...(await getTreeContainedOids(tree.oid)));

    return oids;
  };

  const getCommitContainedOids = async oid => {
    const commitHolder = await git.readCommit({
      dir,
      oid,
    });
    return [oid, ...(await getTreeContainedOids(commitHolder.commit.tree))];
  };

  const commitOidsBetween = async ({ hasOid, wantOid }) => {
    const retrievePath = (commits, oid) => {
      const nextOid = (commits.find(c => c.parent.includes(oid)) || {}).oid;
      if (!nextOid) return [oid];
      return [...retrievePath(commits, nextOid), oid];
    };

    // Breadth first retriving shortest path within git objects graph
    const commits = [];
    //const oids = [];
    const nextOids = [wantOid];
    while (true) {
      const oid = nextOids.shift();

      // when commit already found skip it
      if (commits.find(c => c.oid === oid)) continue;
      // when there is no oid & noe hasOid - return whole commits tree
      if (!oid && !hasOid) return commits.map(c => c.oid);
      // when there is just no oid it's an error
      if (!oid) throw 'Could not find commit with this hasOid';
      // the object found
      if (oid === hasOid) return retrievePath(commits, oid);

      const commitHolder = await git.readCommit({
        dir,
        oid,
      });
      const { parent } = commitHolder.commit;
      commits.push({ oid, parent });
      nextOids.push(...parent);
    }
  };

  const containedOidsBetween = async ({ hasOid, wantOid }) => {
    const oidsBetween = await commitOidsBetween({ hasOid, wantOid });

    const allOids = (await Promise.all(
      oidsBetween.map(o => getCommitContainedOids(o)),
    )).flat();

    const uniqueOids = Array.from(new Set(allOids));
    const initialOids = hasOid ? await getCommitContainedOids(hasOid) : [];
    return uniqueOids.filter(o => !initialOids.includes(o));
  };

  const containedOidsFromOidRanges = async oidRanges => [
    ...new Set((await Promise.all(oidRanges.map(containedOidsBetween))).flat()),
  ];

  const getObjectHolder = async oid => {
    const objectHolder = await git.readObject({
      format: 'content',
      dir,
      oid,
    });

    // NOTE: tree behaves strange, could not parse it regularly
    let parsed;
    if (objectHolder.type === 'tree') {
      const objectHolderParsed = await git.readObject({
        format: 'parsed',
        dir,
        oid,
      });
      parsed = objectHolderParsed.object;
    }
    return { ...objectHolder, object: Array.from(objectHolder.object), parsed };
  };

  const ArrayToString = array =>
    new TextDecoder().decode(Uint8Array.from(array));

  const writeObjectHolder = async objectHolder => {
    const { type, object } = objectHolder;
    if (type === 'blob') {
      await git.writeBlob({ dir, blob: Uint8Array.from(object) });
    } else if (type === 'tree') {
      /*
      const parsedTree = ArrayToString(object)
        .toString()
        .trim()
        .split('\n')
        .map(row => {
          const [mode, type, sha, path] = row.split(/\t| /);
          return { mode, type, sha, path };
        });*/

      await git.writeTree({ dir, tree: objectHolder.parsed.entries });
    } else if (type === 'commit') {
      git.writeCommit({ dir, commit: ArrayToString(object) });
    } else {
      throw new Error('Not Implemented');
    }
  };

  // Resulting export
  // ---------------------------------------------------------------------------

  const helpers = {
    async createObjectBundle(oidRanges) {
      // NOTE: support only one range now
      const { hasOid, wantOid } = oidRanges[0];
      // NOTE: should be a git package
      const oids = await containedOidsFromOidRanges(oidRanges);
      const objectHolders = await Promise.all(oids.map(getObjectHolder));

      return { oidRanges, objectHolders };
    },

    async applyObjectBundle(objectBundle) {
      const { objectHolders } = objectBundle;
      await Promise.all(objectHolders.map(writeObjectHolder));
    },

    async applyDiffBundle(diffBundle) {
      const { refDiff, objectBundle } = diffBundle;
      await helpers.applyObjectBundle(objectBundle);
      await Promise.all(
        refDiff.map(
          async r =>
            await git.writeRef({
              dir,
              ref: r.ref,
              value: r.wantOid,
              force: true,
            }),
        ),
      );

      let hasHead = false;
      try {
        await git.resolveRef({ ref: 'HEAD', dir });
        hasHead = true;
      } catch (e) {}
      if (!hasHead && refDiff.length) {
        await git.writeRef({
          dir,
          ref: 'HEAD',
          value: refDiff[0].ref,
          symbolic: true,
        });
        hasHead = true;
      }
      if (hasHead) {
        const maybeRef = await git.currentBranch({
          fs,
          dir,
          fullname: true,
        });

        if (maybeRef) await git.fastCheckout({ dir, ref: maybeRef });
      }
    },

    async hasRepo() {
      const lstat = promisify(fs.lstat);

      try {
        await lstat('.git');
        return true;
      } catch (e) {
        return false;
      }
    },

    async listRefs() {
      if (!(await this.hasRepo())) return [];
      const gitdir = dir === '/' ? '/.git' : `${dir}/.git`;
      const refs = [
        'HEAD',
        ...(await gitInternals.GitRefManager.listRefs({
          fs,

          gitdir,
          filepath: `refs`,
        })).map(r => `refs/${r}`),
      ];
      const value = await Promise.all(
        refs.map(async ref => {
          const oid = await git.resolveRef({ dir, ref });
          return { oid, ref };
        }),
      );

      return value;
    },
  };
  return helpers;
};
