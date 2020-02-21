// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Step3Invite({
  establish,
  cancelConnection,
  peerIsConnecting,
}) {
  const [wgAnswerKey, setWgAnswerKey] = useState('');

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          {peerIsConnecting && (
            <div className="alert alert-success" role="alert">
              ✅ Yay! Your peer has started connecting to you, and we could
              receive their signals (sometimes it happens, sometimes - not)
            </div>
          )}
          <div className="alert alert-secondary" role="alert">
            📋 That's the last step. Paste the Answer from your peer here and
            submit it.
          </div>
        </div>
      </div>
      <form
        className="row mt-4"
        onSubmit={e => {
          e.preventDefault();
          establish(wgAnswerKey);
        }}
      >
        <div className="col-12">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
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
              disabled={!wgAnswerKey}
            >
              Connect!
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
