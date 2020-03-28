// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = ({ fs, pfs, git, gitInternals, dir = '.' }) => {
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
    const oids = [];
    let oid = wantOid;
    while (true) {
      oids.push(oid);
      const commitHolder = await git.readCommit({
        dir,
        oid,
      });

      nextOid = commitHolder.commit.parent[0];
      if (!nextOid || nextOid === hasOid) break;
      oid = nextOid;
    }
    return oids;
  };

  const containedOidsBetween = async ({ hasOid, wantOid }) => {
    const oidsBetween = await commitOidsBetween({ hasOid, wantOid });

    const allOids = (await Promise.all(
      oidsBetween.map(o => getCommitContainedOids(o)),
    )).flat();

    const uniqueOids = Array.from(new Set(allOids));
    const initialOids = await getCommitContainedOids(hasOid);
    return uniqueOids.filter(o => !initialOids.includes(o));
  };

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

  // Resulting export
  // ---------------------------------------------------------------------------

  return {
    async createBundle({ hasOid, wantOid }) {
      // NOTE: should be a git package
      const oids = await containedOidsBetween({ hasOid, wantOid });
      const objectHolders = await Promise.all(oids.map(getObjectHolder));

      return objectHolders;
    },
  };
};
