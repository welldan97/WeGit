// Imports
// =============================================================================

import React, { Fragment, useState } from 'react';

import Files from './Files';
import Preview from './Preview';

// Main
// =============================================================================

export default function Repo({
  repoName,
  currentBranch,
  branches,
  onChangeBranch,
  lastCommitHolder,

  path,
  onPathChange,
  files,
  previewFile,
  currentFile,
}) {
  const pathParts = path === '/' ? [] : path.replace(/^\//, '').split('/');

  const [isBranchOpen, setIsBranchOpen] = useState(false);

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <button
            className="btn btn-link btn-lg p-0 text-info"
            onClick={() => onPathChange('/')}
            type="button"
            key="root"
          >
            {'\u{1F5C4} '}
            {repoName || 'noname'}
          </button>
          {'\u{00A0}\u{00A0} /'}
          {' \u{00A0}\u{00A0}'}
          <div
            className="dropdown d-inline-block"
            onClick={() => setIsBranchOpen(!isBranchOpen)}
          >
            <button className="btn btn-secondary dropdown-toggle" type="button">
              {'\u{1F500} '}
              <span className="mx-1">{currentBranch}</span>
            </button>
            <div
              className={`dropdown-menu ${isBranchOpen ? 'show' : ''}`}
              aria-labelledby="dropdownMenuButton"
            >
              {branches.map(b => (
                <a
                  className="dropdown-item"
                  href="#"
                  key={b}
                  onClick={e => {
                    e.preventDefault();
                    onChangeBranch(b);
                  }}
                >
                  {b}
                </a>
              ))}
            </div>
          </div>
          {!!pathParts.length && '\u{00A0}\u{00A0} /'}
          {pathParts.map((p, i) => (
            <Fragment key={i}>
              {' \u{00A0}\u{00A0}'}
              <button
                className="btn btn-link btn-lg p-0 text-info"
                onClick={() =>
                  onPathChange(`/${pathParts.slice(0, i + 1).join('/')}`)
                }
                type="button"
              >
                {!currentFile.isDirectory && i === pathParts.length - 1
                  ? '\u{1F4C4} '
                  : '\u{1F4C1} '}
                {p}
                {i !== pathParts.length - 1 && '\u{00A0}\u{00A0} /'}
              </button>
            </Fragment>
          ))}
        </div>
      </div>
      {currentFile.isDirectory && (
        <div className="row mt-4">
          <div className="col-12">
            <Files
              lastCommitHolder={lastCommitHolder}
              files={files}
              path={path}
              onPathChange={onPathChange}
            />
          </div>
        </div>
      )}

      <div className="row mt-4">
        <div className="col-12">
          {previewFile && <Preview previewFile={previewFile} />}{' '}
        </div>
      </div>
    </>
  );
}
