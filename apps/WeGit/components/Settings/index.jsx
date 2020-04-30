// Imports
// =============================================================================

import React, { memo, useCallback, useState } from 'react';

// Main
// =============================================================================

export default function Settings({ onReset }) {
  return (
    <div className="row mt-4">
      <div className="col-12 border border-danger pt-3 pb-3">
        <>
          <div className="alert alert-danger" role="alert">
            ⚠️ Danger zone
          </div>
          <button
            type="button"
            className="btn btn-danger btn-lg mt-4 mx-auto d-block"
            onClick={onReset}
          >
            Reset repository
          </button>
        </>
      </div>
    </div>
  );
}
