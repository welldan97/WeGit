// Imports
// =============================================================================

import React from '../lib/shims/React';

// Main
// =============================================================================

export default function Navbar({ active, onActivate }) {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
      <a className="navbar-brand" href="#">
        WeGit
      </a>
      <ul className="navbar-nav mr-auto">
        <li className={`nav-item ${active === 'currentApp' ? 'active' : ''}`}>
          <a
            className="nav-link"
            href="#"
            onClick={() => onActivate('currentApp')}
          >
            Current App
          </a>
        </li>
        <li className={`nav-item ${active === 'apps' ? 'active' : ''}`}>
          <a className="nav-link" href="#" onClick={() => onActivate('apps')}>
            Apps
          </a>
        </li>
        <li className={`nav-item ${active === 'network' ? 'active' : ''}`}>
          <a
            className="nav-link"
            href="#"
            onClick={() => onActivate('network')}
          >
            Network
          </a>
        </li>

        <li className={`nav-item ${active === 'about' ? 'active' : ''}`}>
          <a className="nav-link" href="#" onClick={() => onActivate('about')}>
            About
          </a>
        </li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className={`nav-item ${active === 'user' ? 'active' : ''}`}>
          <a className="nav-link" href="#" onClick={() => onActivate('user')}>
            User
          </a>
        </li>
      </ul>
    </nav>
  );
}
