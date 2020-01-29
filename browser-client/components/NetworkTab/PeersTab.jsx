// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function PeersTab({ meshState, closeConnection }) {
  if (!meshState.connections.length)
    return (
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p className="mb-0">
                You don't have any connected peers, so sad!
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <ul className="list-group list-group-flush mt-4">
      {meshState.connections.map(c => {
        const type = c.state === 'connected' ? 'success' : 'info';
        return (
          <li
            className={`list-group-item
                    border border-${type} text-${type}
                    d-flex justify-content-between align-items-center`}
            key={c.id}
          >
            <span>
              🌎 {(c.user && c.user.userName) || 'Unknown user'} ({c.state})
            </span>
            <a
              className="text-danger"
              href="#"
              onClick={e => {
                e.preventDefault();
                closeConnection(c.id);
              }}
            >
              ×
            </a>
          </li>
        );
      })}
    </ul>
  );
}
