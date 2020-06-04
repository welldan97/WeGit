// Imports
// =============================================================================

import React, { memo, useEffect, useState } from 'react';

// Main
// =============================================================================

export default function Settings({
  repoName: baseRepoName,
  onReset,
  onChangeRepoName,
}) {
  const [repoName, setRepoName] = useState(baseRepoName || '');
  console.log(repoName);
  useEffect(() => {
    if (baseRepoName !== undefined && repoName !== baseRepoName)
      setRepoName(baseRepoName);
  }, [baseRepoName]);

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="userName">Repository name</label>
            <input
              type="text"
              className="form-control"
              value={repoName}
              placeholder="noname"
              onChange={e => setRepoName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-success btn-lg mt-4 mx-auto d-block"
            onClick={() => onChangeRepoName(repoName)}
          >
            Save
          </button>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="border border-danger p-3">
            <div className="alert alert-danger" role="alert">
              ⚠️ Danger zone
            </div>
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mx-auto d-block"
              onClick={onReset}
            >
              Reset repository
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
