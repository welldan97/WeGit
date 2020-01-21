// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Step2Join({ joinConnection, cancelConnection }) {
  const [wgOfferKey, setWgOfferKey] = useState('');

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: '33%' }}
              aria-valuenow="33"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>Paste the offer from your peer here and click "Submit"</p>
            </div>
          </div>
        </div>
      </div>
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          joinConnection(wgOfferKey);
        }}
      >
        <div className="col-12">
          <label htmlFor="offer">Offer</label>
          <textarea
            id="offer"
            className="form-control text-monospace"
            rows="6"
            placeholder="Paste your offer here"
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
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
