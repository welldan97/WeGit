// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

// Main
// =============================================================================

export default function JoinTab({ wgAnswerKey, joinConnection }) {
  const [wgOfferKey, setWgOfferKey] = useState('');
  return (
    <>
      {wgAnswerKey && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-success mb-0" role="alert">
              The answer has been created an copied to your clipboard
            </div>
          </div>
        </div>
      )}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>Join a connection of your peer:</p>
              <ol>
                <li>
                  Paste the offer which your peer sends to you to the left
                  textbox and then click "Join";
                </li>
                <li>
                  Send the answer to your peer and then they should establish a
                  connection.
                </li>
              </ol>
              <p>
                After that you should be connected to the peer and theirs peers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <form className="row mt-4">
        <div className="col-6">
          <label htmlFor="offer">Offer</label>

          <textarea
            id="offer"
            className={`form-control ${wgAnswerKey ? 'bg-light' : ''}`}
            rows="6"
            placeholder="Paste the offer here"
            value={wgOfferKey}
            onChange={e => {
              setWgOfferKey(e.target.value);
            }}
            disabled={!!wgAnswerKey}
          />
        </div>
        <div className="col-6">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            className="form-control bg-light"
            rows="6"
            placeholder="Your answer will appear here"
            disabled
            value={wgAnswerKey}
          />
        </div>
        <button
          type="button"
          className="btn btn-success btn-lg mt-4 mx-auto"
          onClick={() => joinConnection(wgOfferKey)}
          disabled={!wgOfferKey || wgAnswerKey}
        >
          Join
        </button>
      </form>
    </>
  );
}
