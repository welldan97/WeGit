// Imports
// =============================================================================

import React from 'react';

// Utilities
// =============================================================================
const formatCommitDate = file =>
  (file.commitHolder &&
    file.commitHolder.commit &&
    file.commitHolder.commit.committer &&
    file.commitHolder.commit.committer.timestamp &&
    new Date(file.commitHolder.commit.committer.timestamp * 1000)
      .toISOString()
      .replace(/T.*$/, '')) ||
  '';

const formatCommitMessage = file =>
  (file.commitHolder &&
    file.commitHolder.commit &&
    file.commitHolder.commit.message.split('\n')[0]) ||
  '';

false;
// Main
// =============================================================================

export default function Files({ currentFile, files, path, onPathChange }) {
  return (
    <table className="table table-borderless">
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
              {formatCommitMessage(f)}
            </td>
            <td
              className="text-right text-monospace"
              style={{ minWidth: '120px' }}
            >
              {formatCommitDate(f)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
