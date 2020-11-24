// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Step3Join({
  clipboardIsWorking,
  wgAnswerKey,
  cancelConnection,
}) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          {!wgAnswerKey && (
            <div className="alert alert-secondary" role="alert">
              ⏳ Please wait… Your Answer is being created
            </div>
          )}
          {wgAnswerKey && (
            <div className="alert alert-success" role="alert">
              ✅ Yay! Your Answer has been created
              {clipboardIsWorking ? (
                ' and it was copied to clipboard 📋'
              ) : (
                <>
                  , but it <strong>could not</strong> be copied to clipboard
                </>
              )}
              .
              <br />
              Send it to your peer and wait to finalize connection…
            </div>
          )}
        </div>
      </div>
      <form className="row mt-4">
        <div className="col-12">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            className="form-control bg-light text-monospace"
            rows="6"
            placeholder="Your Answer will appear here"
            readOnly
            value={wgAnswerKey}
          />
          {wgAnswerKey && (
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mx-auto d-block"
              onClick={() => cancelConnection()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
