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
      {meshState.state === 'disconnected' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <p>
                  You are not connected to anyone yet. Start creating connection
                  or join one
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
