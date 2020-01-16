// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

// Main
// =============================================================================

export default function CreateTab({
  wgOfferKey,
  createConnection,
  establishConnection,
}) {
  const [wgAnswerKey, setWgAnswerKey] = useState('');

  return (
    <>
      {wgOfferKey && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-success mb-0" role="alert">
              The offer has been created an copied to your clipboard
            </div>
          </div>
        </div>
      )}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p>Create a connection with your peer:</p>
              <ol>
                <li>
                  Click "Create" Button. This will create an offer which should
                  be automatically copied to your clipboard;
                </li>
                <li>
                  Send the offer to your peer and ask them to send you an
                  answer;
                </li>
                <li>
                  Paste the answer to the right textbox and click "Establish
                  Connection".
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
            className="form-control bg-light"
            rows="6"
            placeholder="Your offer will appear here"
            disabled
            value={wgOfferKey}
          />
        </div>
        <div className="col-6">
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            className={`form-control ${wgOfferKey ? '' : 'bg-light'}`}
            rows="6"
            placeholder="Paste the answer here"
            value={wgAnswerKey}
            onChange={e => {
              setWgAnswerKey(e.target.value);
            }}
          />
        </div>
        {!wgOfferKey && (
          <button
            type="button"
            className="btn btn-success btn-lg mt-4 mx-auto"
            onClick={createConnection}
          >
            Create
          </button>
        )}
        {!!wgOfferKey && (
          <button
            type="button"
            className="btn btn-success btn-lg mt-4 mx-auto"
            onClick={() => establishConnection(wgAnswerKey)}
            disabled={!wgAnswerKey}
          >
            Establish Connection
          </button>
        )}
      </form>
    </>
  );
}
