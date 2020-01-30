// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Navbar({ active, onActivate, meshState, userName }) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

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
            {meshState.globalState === 'connected' && '✅'}
            Network
          </a>
        </li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdown"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={() => setDropdownIsOpen(!dropdownIsOpen)}
          >
            {userName || 'Unknown user'}
          </a>
          <div
            className={`dropdown-menu dropdown-menu-right ${
              dropdownIsOpen ? 'show' : ''
            }`}
            aria-labelledby="navbarDropdown"
          >
            <a
              className="dropdown-item"
              href="#"
              onClick={() => onActivate('settings')}
            >
              Settings
            </a>
            <a
              className="dropdown-item"
              href="#"
              onClick={() => onActivate('about')}
            >
              About
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
}
