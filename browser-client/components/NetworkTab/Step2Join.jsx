// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Step2Join({ join, cancelConnection }) {
  const [wgOfferKey, setWgOfferKey] = useState('');

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-secondary" role="alert">
            📋 Paste the Offer from your peer here and go to the next step
          </div>
        </div>
      </div>
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          join(wgOfferKey);
        }}
      >
        <div className="col-12">
          <label htmlFor="offer">Offer</label>
          <textarea
            id="offer"
            className="form-control text-monospace"
            rows="6"
            placeholder="Paste your Offer here"
            value={wgOfferKey}
            onChange={e => setWgOfferKey(e.target.value)}
          />
          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mr-4 d-block"
              onClick={() => cancelConnection()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success btn-lg mt-4 d-block"
              disabled={!wgOfferKey}
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
