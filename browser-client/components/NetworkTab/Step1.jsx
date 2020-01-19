// Imports
// =============================================================================

import React from '../../lib/shims/React';

// Main
// =============================================================================

export default function Step1({
  meshState,
  createConnection,
  startJoiningConnection,
}) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {meshState.state === 'disconnected' && (
                <p>
                  You are not connected to anyone yet. Start creating connection
                  or join one
                </p>
              )}
              {meshState.state === 'connected' && (
                <p>
                  Yay, looks like you are already connected.
                  <br />
                  But you can connect to more peers. More people — more fun!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <form className="row mt-4">
        <div className="col-12 d-flex justify-content-center">
          <div>
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={() => createConnection()}
            >
              Create Connection
            </button>
            <span className="mx-4">Or</span>
            <button
              type="button"
              className="btn btn-info btn-lg"
              onClick={() => startJoiningConnection()}
            >
              Join Connection
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
