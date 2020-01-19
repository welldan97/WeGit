// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

// Main
// =============================================================================

export default function Step3Create({ establishConnection }) {
  const [wgAnswerKey, setWgAnswerKey] = useState('');

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>
                Your peer has started connecting to you.
                <br />
                Paste their answer here and click "Establish Connection"
              </p>
            </div>
          </div>
        </div>
      </div>
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          establishConnection(wgAnswerKey);
        }}
      >
        <div className="col-12">
          <label htmlFor="offer">Offer</label>
          <textarea
            id="offer"
            className="form-control text-monospace"
            rows="6"
            placeholder="Paste your offer here"
            value={wgAnswerKey}
            onChange={e => setWgAnswerKey(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-success btn-lg mt-4 mx-auto d-block"
          >
            Establish Connection
          </button>
        </div>
      </form>
    </>
  );
}
