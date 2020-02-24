// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Tabs({ active, onActivate }) {
  return (
    <div className="row">
      <div className="col-12">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${
                active === 'main' ? 'active bg-secondary' : ''
              }`}
              href="#"
              onClick={() => onActivate('main')}
            >
              {'\u{1F3E0} '}Home
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                active === 'pullRequests' ? 'active bg-secondary' : ''
              }`}
              href="#"
              onClick={() => onActivate('pullRequests')}
            >
              {'\u{21A9} '}Pull Requests
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                active === 'ciCd' ? 'active bg-secondary' : ''
              }`}
              href="#"
              onClick={() => onActivate('ciCd')}
            >
              {'\u{1F4E6} '}CI / CD
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                active === 'settings' ? 'active bg-secondary' : ''
              }`}
              href="#"
              onClick={() => onActivate('settings')}
            >
              {'\u{2699} '}Settings
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
