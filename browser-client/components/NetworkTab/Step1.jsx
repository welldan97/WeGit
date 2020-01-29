// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Step1({ meshState, invite, startJoiningConnection }) {
  return (
    <>
      {meshState.globalState === 'disconnected' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <p className="mb-0">
                  You are not connected to anyone yet. Invite someone to join
                  you, or join them yourself!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <form className="row mt-4">
        <div className="col-12 d-flex justify-content-center">
          <div>
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={() => invite()}
            >
              Invite
            </button>
            <span className="mx-4">Or</span>
            <button
              type="button"
              className="btn btn-info btn-lg"
              onClick={() => startJoiningConnection()}
            >
              Join
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
