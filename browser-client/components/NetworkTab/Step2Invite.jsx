// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Step2Invite({
  clipboardIsWorking,
  wgOfferKey,
  startEstablishing,
  cancelConnection,
}) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          {!wgOfferKey && (
            <div className="alert alert-secondary" role="alert">
              ⏳ Please wait… Your Offer is being created
            </div>
          )}
          {wgOfferKey && (
            <div className="alert alert-success" role="alert">
              ✅ Yay! Your Offer has been created
              {clipboardIsWorking ? (
                ' and it was copied to clipboard 📋'
              ) : (
                <>
                  , but it <strong>could not</strong> be copied to clipboard
                </>
              )}
              .
              <br />
              Send it to your peer and go to the next step
            </div>
          )}
        </div>
      </div>
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          startEstablishing();
        }}
      >
        <div className="col-12">
          <label htmlFor="offer">Offer</label>
          <textarea
            id="offer"
            className="form-control bg-light text-monospace"
            rows="6"
            placeholder="Your Offer will appear here"
            readOnly
            value={wgOfferKey}
          />
          {wgOfferKey && (
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
          )}
        </div>
      </form>
    </>
  );
}
