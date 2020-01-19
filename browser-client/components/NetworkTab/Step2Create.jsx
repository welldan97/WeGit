// Imports
// =============================================================================

import React from '../../lib/shims/React';

// Main
// =============================================================================

export default function Step2Create({ wgOfferKey }) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>
                You have created a connection offer, and it has been copied to
                your clipboard.
                <br />
                Send it to your peer and wait for them to start connecting to
                you
              </p>
            </div>
          </div>
        </div>
      </div>
      <form className="row mt-4">
        <div className="col-12">
          <label htmlFor="offer">Offer</label>
          <textarea
            id="offer"
            className="form-control bg-light text-monospace"
            rows="6"
            placeholder="Your answer will appear here"
            disabled
            value={wgOfferKey}
          />
        </div>
      </form>
    </>
  );
}
