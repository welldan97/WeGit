// Imports
// =============================================================================

import React, { Fragment } from 'react';

import Files from './Files';
import Preview from './Preview';

// Main
// =============================================================================

export default function Repo({
  repoName,
  currentBranch,

  path,
  onPathChange,
  files,
  previewFile,
  currentFile,
}) {
  const pathParts = path === '/' ? [] : path.replace(/^\//, '').split('/');

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
            {'\u{00A0}\u{00A0} /'}
          </button>
          {' \u{00A0}\u{00A0}'}
          <button
            className="btn btn-link btn-lg p-0 text-info"
            onClick={() => onPathChange('/')}
            type="button"
            key="branch"
          >
            {'\u{1F500} '}
            {currentBranch}
            {!!pathParts.length && '\u{00A0}\u{00A0} /'}
          </button>
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
      <div className="row mt-4">
        <div className="col-12">
          {currentFile.isDirectory && (
            <Files files={files} path={path} onPathChange={onPathChange} />
          )}
          {previewFile && <Preview previewFile={previewFile} />}
        </div>
      </div>
    </>
  );
}
