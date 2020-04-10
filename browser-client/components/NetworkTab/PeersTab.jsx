// Imports
// =============================================================================

import React from 'react';

// Utils
// =============================================================================

const getUserType = user => {
  console.log(user);
  switch (user.type) {
    case 'browser':
      return '\u{1F30D}';
    case 'server':
      return '\u{1F4BB}';
    case 'signalling':
      return '\u{1F4E1}';
    default:
      return '\u{1F464}';
  }
};
// Main
// =============================================================================

export default function PeersTab({ currentUser, meshState, closeConnection }) {
  return (
    <ul className="list-group list-group-flush mt-4">
      <li
        className={`list-group-item
                border border-success text-success
                d-flex justify-content-between align-items-center`}
      >
        <span>
          {getUserType(currentUser)} {currentUser.userName || 'Unknown user'} (
          <em>That's you</em>)
        </span>
      </li>
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
              {getUserType(c.user || {})}{' '}
              {(c.user && c.user.userName) || 'Unknown user'} (
              <em>{c.state}</em>)
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
