// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Step2Invite({
  wgOfferKey,
  startEstablishingConnection,
  cancelConnection,
}) {
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
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          startEstablishingConnection();
        }}
      >
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
              Next
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
