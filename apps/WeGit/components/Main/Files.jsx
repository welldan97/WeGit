// Imports
// =============================================================================

import React from 'react';

// Utilities
// =============================================================================
const formatCommitDate = commitHolder =>
  (commitHolder &&
    commitHolder.commit &&
    commitHolder.commit.committer &&
    commitHolder.commit.committer.timestamp &&
    new Date(commitHolder.commit.committer.timestamp * 1000)
      .toISOString()
      .replace(/T.*$/, '')) ||
  '';

const formatCommitMessage = commitHolder =>
  (commitHolder &&
    commitHolder.commit &&
    commitHolder.commit.message.split('\n')[0]) ||
  '';

// Main
// =============================================================================

export default function Files({
  lastCommitHolder,
  currentFile,
  files,
  path,
  onPathChange,
}) {
  const commit = lastCommitHolder && lastCommitHolder.commit;
  return (
    <div className="card bg-transparent">
      <div className="card-header">
        {!!commit && (
          <div className="d-flex">
            <div>
              <strong className="mr-3 text-nowrap">{commit.author.name}</strong>
            </div>
            <div className="flex-fill text-truncate mr-3">
              {formatCommitMessage(lastCommitHolder)}
            </div>
            <div className="text-right text-nowrap">
              <span className="mr-3">{lastCommitHolder.oid.slice(0, 7)}</span>
              {formatCommitDate(lastCommitHolder)}
            </div>
          </div>
        )}
      </div>
      <div className="card-body p-0">
        <table className="table table-borderless m-0">
          <tbody>
            {path !== '/' && (
              <tr className="border border-info" key="..">
                <th scope="row">
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onPathChange(path.replace(/\/[^/]*$/, '') || '/');
                    }}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    {'\u{1F4C1}'}
                    ..
                  </a>
                </th>
                <td></td>
                <td></td>
              </tr>
            )}
            {files.map((f, i) => (
              <tr className="border border-info" key={i}>
                <th scope="row" style={{ minWidth: '180px' }}>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onPathChange(`${path === '/' ? '' : path}/${f.name}`);
                    }}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    {f.isDirectory ? '\u{1F4C1} ' : '\u{1F4C4} '}
                    {f.name}
                  </a>
                </th>
                <td className="text-truncate" style={{ maxWidth: '380px' }}>
                  {formatCommitMessage(f.commitHolder)}
                </td>
                <td
                  className="text-right text-monospace"
                  style={{ minWidth: '120px' }}
                >
                  {formatCommitDate(f.commitHolder)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
