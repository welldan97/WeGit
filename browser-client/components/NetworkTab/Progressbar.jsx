// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Progressbar({ progress }) {
  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="progress">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    </div>
  );
}
