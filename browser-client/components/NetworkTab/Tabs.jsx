// Imports
// =============================================================================

import React from '../../lib/shims/React';

// Main
// =============================================================================

export default function Tabs({ active, onActivate }) {
  return (
    <ul className="nav nav-tabs">
      <li className="nav-item">
        <a
          className={`nav-link ${active === 'create' ? 'active' : ''}`}
          href="#"
          onClick={() => onActivate('create')}
        >
          Create Connection
        </a>
      </li>
      <li className="nav-item">
        <a
          className={`nav-link ${active === 'join' ? 'active' : ''}`}
          href="#"
          onClick={() => onActivate('join')}
        >
          Join Connection
        </a>
      </li>
      <li className="nav-item">
        <a
          className={`nav-link ${active === 'peers' ? 'active' : ''}`}
          href="#"
          onClick={() => onActivate('peers')}
        >
          Peers
        </a>
      </li>
    </ul>
  );
}
