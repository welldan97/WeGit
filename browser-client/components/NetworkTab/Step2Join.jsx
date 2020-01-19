// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

// Main
// =============================================================================

export default function Step2Join({ joinConnection }) {
  const [wgOfferKey, setWgOfferKey] = useState('');

  return (
    <>
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

          <button
            type="submit"
            className="btn btn-success btn-lg mt-4 mx-auto d-block"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
