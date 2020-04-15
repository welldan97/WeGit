// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function ShareTab({ onDownload }) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <h2>Share</h2>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12 ">
          <button
            type="button"
            className="btn btn-success btn-lg mt-4 mx-auto d-block"
            onClick={onDownload}
          >
            Download
          </button>
        </div>
      </div>
    </>
  );
}
