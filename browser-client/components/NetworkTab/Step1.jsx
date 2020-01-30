// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Step1({
  meshState,
  networkAlert,
  invite,
  startJoining,
}) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          {networkAlert && (
            <div className={`alert alert-${networkAlert.type}`} role="alert">
              {networkAlert.message}
            </div>
          )}

          {meshState.globalState === 'disconnected' && (
            <div className="alert alert-secondary" role="alert">
              😞 You are not connected to anyone yet. Invite someone to join
              you, or join them yourself!
            </div>
          )}

          {meshState.globalState !== 'disconnected' && (
            <div className="alert alert-secondary" role="alert">
              👯 You are already connected, but you can always connect to more
              peers. More people - more fun!
            </div>
          )}
        </div>
      </div>
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
              onClick={() => startJoining()}
            >
              Join
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
