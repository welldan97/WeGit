// Imports
// =============================================================================

import React from '../shims/React';

// Main
// =============================================================================

export default function Files({ files, path, onPathChange }) {
  return (
    <table style={{ textAlign: 'left' }}>
      <tbody>
        {files.map((f, i) => (
          <tr key={i}>
            <th>
              {f.isDirectory ? '📁 ' : '  '}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onPathChange(`${path}/${f.name}`);
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
