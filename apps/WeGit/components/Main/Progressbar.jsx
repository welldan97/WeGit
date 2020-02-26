// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Progressbar({ progress: progressObject }) {
  const { loaded, total, lengthComputable } = progressObject || {};
  const isPresent = !!progressObject;

  let progress = 100;
  if (lengthComputable) progress = Math.round((loaded / total) * 100);

  return (
    <div
      className={`row ${isPresent ? 'mt-4' : ''}`}
      style={
        isPresent
          ? { transition: 'opacity 300ms' }
          : { opacity: '0', height: '0' }
      }
    >
      <div className="col-12">
        <div className="progress">
          <div
            className={`progress-bar bg-success ${
              lengthComputable
                ? ''
                : 'progress-bar-striped progress-bar-animated'
            }`}
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
