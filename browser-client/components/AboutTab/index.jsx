// Imports
// =============================================================================

import { readFileSync } from 'fs';

import React, { useEffect } from 'react';

import Logo from './Logo';

// Main
// =============================================================================

export default function AboutTab() {
  useEffect(() => {
    document.body.style.background = 'black';
    return () => {
      document.body.style.background = '';
    };
  });
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <h2>About</h2>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <Logo />
        </div>
      </div>
    </>
  );
}
