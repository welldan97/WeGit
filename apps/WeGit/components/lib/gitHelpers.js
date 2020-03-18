// Imports
// =============================================================================

// Main
// =============================================================================

export default ({ git, gitInternals, fs }) => {
  // Utils
  // ---------------------------------------------------------------------------

  const findFileHoldersForTree = async (treeOid, path, files) => {
    const treeHolder = await git.readTree({
      dir: '/',
      oid: treeOid,
    });
    if (path === '/')
      return treeHolder.tree.filter(o =>
        files.map(f => f.name).includes(o.path),
      );
    const firstDir = path.match(/\/([^/]+)/)[1];
    const nextTreeOid = treeHolder.tree.find(o => o.path === firstDir).oid;
    const restPath = path.replace(/^\/([^/])+/, '') || '/';
    return await findFileHoldersForTree(nextTreeOid, restPath, files);
  };

  const findFileHoldersForCommit = async (commitOid, path, files) => {
    const commitHolder = await git.readCommit({
      dir: '/',
      oid: commitOid,
    });
    const fileHolders = await findFileHoldersForTree(
      commitHolder.commit.tree,
      path,
      files,
    );
    return {
      commitHolder: commitHolder,
      fileHolders,
    };
  };

  const findFilesLastCommitsImplementation = async ({
    commitOid,
    path,
    files,
    fileTable = undefined,
    prevCommitHolder = undefined,
  }) => {
    const { commitHolder, fileHolders } = await findFileHoldersForCommit(
      commitOid,
      path,
      files,
    );
    // NOTE: doesn't take in account merges
    const parentCommitOid = commitHolder.commit.parent[0];
    let nextFileTable;

    if (!fileTable)
      nextFileTable = fileHolders.map(e => ({
        path: e.path,
        oid: e.oid,
        commitHolder: undefined,
      }));
    else
      nextFileTable = fileTable.map(f => ({
        ...f,
        commitHolder:
          f.commitHolder ||
          (f.oid === (fileHolders.find(fh => fh.path === f.path) || {}).oid
            ? undefined
            : prevCommitHolder),
      }));

    if (!parentCommitOid)
      nextFileTable = fileTable.map(e => ({
        ...e,
        commitHolder: e.commitHolder || commitHolder,
      }));

    if (nextFileTable.every(e => e.commitHolder))
      return files.map(f => ({
        ...f,
        commitHolder: nextFileTable.find(ff => ff.path === f.name).commitHolder,
      }));

    return findFilesLastCommitsImplementation({
      commitOid: parentCommitOid,
      path,
      files,
      fileTable: nextFileTable,
      prevCommitHolder: commitHolder,
    });
  };

  // Resulting export
  // ---------------------------------------------------------------------------

  return {
    async findFilesLastCommits(path, files) {
      const commitOid = await git.resolveRef({ dir: '/', ref: 'HEAD' });
      return await findFilesLastCommitsImplementation({
        commitOid,
        path,
        files,
      });
    },
  };
};
