// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Tabs({
  active,
  onActivate,
  connectingPeersCount,
  connectedPeersCount,
}) {
  return (
    <ul className="nav nav-pills">
      <li className="nav-item">
        <a
          className={`nav-link ${
            active === 'connect' ? 'active bg-secondary' : ''
          }`}
          href="#"
          onClick={() => onActivate('connect')}
        >
          Connect
        </a>
      </li>
      <li className="nav-item">
        <a
          className={`nav-link d-flex justify-content-between align-items-center ${
            active === 'peers' ? 'active bg-secondary' : ''
          }`}
          href="#"
          onClick={() => onActivate('peers')}
        >
          <span>Peers</span>
          {connectingPeersCount > 0 && (
            <span className="badge badge-info badge-pill ml-2">
              {connectingPeersCount}
            </span>
          )}
          {connectedPeersCount > 0 && (
            <span className="badge badge-success badge-pill ml-2">
              {connectedPeersCount}
            </span>
          )}
        </a>
      </li>
    </ul>
  );
}
