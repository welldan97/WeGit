// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Files({ currentFile, files, path, onPathChange }) {
  return (
    <table className="table table-bordered border-info">
      <tbody>
        {path !== '/' && (
          <tr key="..">
            <th className="border-info" scope="row">
              {'\u{1F4C1}'}
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
                ..
              </a>
            </th>
          </tr>
        )}
        {files.map((f, i) => (
          <tr key={i}>
            <th className="border-info" scope="row">
              {f.isDirectory ? '\u{1F4C1} ' : '\u{1F4C4} '}
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
                {f.name}
              </a>
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
