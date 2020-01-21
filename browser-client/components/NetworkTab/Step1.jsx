// Imports
// =============================================================================

import React from 'react';

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
          <div className="progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: '0' }}
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
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
