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
  const style = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  };
  if (!isPresent) return null;
  return (
    <div className="bg-secondary p-2 d-flex" style={style}>
      <div className="mr-2" style={{ width: '400px' }}>
        {'\u{23F3}'}
        {progressObject.phase}…
      </div>
      <div className="w-100 border border-success">
        <div
          className={`progress-bar bg-success h-100 ${
            lengthComputable ? '' : 'progress-bar-striped progress-bar-animated'
          }`}
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
