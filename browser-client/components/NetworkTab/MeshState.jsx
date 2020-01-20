// Imports
// =============================================================================

import React from '../../lib/shims/React';

// Main
// =============================================================================

export default function MeshState({ meshState }) {
  return (
    <>
      <p>
        {meshState.state === 'connected' && (
          <span className="text-success">✅connected</span>
        )}
        {meshState.state === 'connecting' && (
          <span className="text-info">⏳connecting</span>
        )}
        {meshState.state === 'disconnected' && (
          <span className="text-danger">❌disconnected</span>
        )}
      </p>
      {!!meshState.connections.length && (
        <>
          <p className="mb-2">Your connections:</p>
          <ul className="list-group list-group-flush">
            {meshState.connections.map(c => {
              const type = c.state === 'connected' ? 'success' : 'info';
              return (
                <li
                  className={`list-group-item
                    border border-${type} text-${type}
                    d-flex justify-content-between align-items-center`}
                  key={c.id}
                >
                  <span>🌎 {c.userName || 'Unknown user'}</span>
                  <span>{c.state}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <hr className="mt-4" />
    </>
  );
}
