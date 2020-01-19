// Imports
// =============================================================================

import React from '../../lib/shims/React';

// Main
// =============================================================================

export default function Step3Join({ wgAnswerKey }) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>
                You have created a connection answer, and it has been copied to
                your clipboard.
                <br />
                Send it to your peer.
              </p>
            </div>
          </div>
        </div>
      </div>
      <form className="row mt-4">
        <div className="col-12">
          <label htmlFor="offer">Answer</label>
          <textarea
            id="offer"
            className="form-control bg-light text-monospace"
            rows="6"
            placeholder="Your answer will appear here"
            disabled
            value={wgAnswerKey}
          />
        </div>
      </form>
    </>
  );
}
