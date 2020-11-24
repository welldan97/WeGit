// Imports
// =============================================================================

import React, { useCallback, useState } from 'react';

// Main
// =============================================================================

const defaultUrl = 'https://github.com/piuccio/cowsay';

export default function NoRepo({ progress, onClone }) {
  const [cloneUrl, setCloneUrl] = useState(defaultUrl);

  return (
    <>
      {progress && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-secondary" role="alert">
              <h2 className="card-title text-center">
                Preparing your repository, please wait… <br />
                {'\u{1f477}'}
              </h2>
            </div>
          </div>
        </div>
      )}
      {!progress && (
        <>
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-secondary" role="alert">
                <h2 className="card-title text-center">
                  Your repository is empty <br />
                  {'\u{1f573}'}
                </h2>
                <p>Choose a way to get started:</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title text-center">
                    {'\u{2B07} '}Clone from another place
                  </h3>
                  <p className="card-text">
                    Just fill in the url, and the repository would be cloned
                    from there, and will appear here
                  </p>
                  <form
                    style={{ display: 'contents' }}
                    onSubmit={e => {
                      e.preventDefault();
                      onClone(cloneUrl);
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="url">Repo URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="url"
                        value={cloneUrl}
                        placeholder="Unknown user"
                        onChange={e => setCloneUrl(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success btn-lg mt-4 mx-auto d-block"
                    >
                      Clone
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title text-center">
                    {'\u{2B06} '}Push an existing repository
                  </h3>
                  <p className="card-text">
                    You can do it via command line interface.
                  </p>
                  <p className="card-text">
                    First you need to install git remote helper:
                  </p>
                  <pre>npm install git-remote-wegit --global</pre>
                  <p className="card-text">Then run the wegit Node.js bridge</p>
                  <pre>npx wegit-node-bridge</pre>
                  <p className="card-text">
                    Make sure you got connected to the browser application.
                    <br />
                    And finally add remote and push:
                  </p>
                  <pre>
                    git remote add origin wegit://example <br />
                    git push -u origin master
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
