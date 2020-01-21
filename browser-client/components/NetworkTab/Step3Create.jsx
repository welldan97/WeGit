// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Step3Create({ establishConnection, cancelConnection }) {
  const [wgAnswerKey, setWgAnswerKey] = useState('');

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: '67%' }}
              aria-valuenow="67"
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
            placeholder="Paste your answer here"
            value={wgAnswerKey}
            onChange={e => setWgAnswerKey(e.target.value)}
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
              Establish Connection
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
