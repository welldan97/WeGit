// Imports
// =============================================================================

import React, { memo, useEffect, useCallback, useState } from 'react';

import useGit from './useGit';
import useFs from './useFs';

import Main from './Main';
import Tabs from './Tabs';

// Main
// =============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [basePath, setBasePath] = useState('/');
  const onPathChange = useCallback(path => setBasePath(path), [setBasePath]);

  const repoName = '';
  const ciState = 'disabled';
  const {
    fs,
    onFsUpdate,
    hasRepo,
    files,
    previewFile,
    currentFile,
    path,
  } = useFs({
    path: basePath,
  });

  const {
    isReady,
    onClone,
    progress,
    currentBranch,
    findFilesLastCommits,
  } = useGit({
    fs,
    hasRepo,
    onFsUpdate,
  });

  const [filesWithCommits, setFilesWithCommits] = useState([]);
  useEffect(() => {
    setFilesWithCommits(files);
    if (currentFile.isDirectory && findFilesLastCommits)
      (async () =>
        setFilesWithCommits(await findFilesLastCommits(path, files)))();
  }, [files, findFilesLastCommits]);

  if (!isReady) return null;
  return (
    <div className="container mb-4" style={{ maxWidth: '720px' }}>
      <div className="row mt-4">
        <div className="col-12">
          <h2>
            {'\u{1F5C4} '}
            {repoName || 'noname'}
          </h2>
          <p>
            {ciState === 'success' && (
              <span className="text-success">
                {'\u{2705}'} tests are passing
              </span>
            )}
            {ciState === 'fail' && (
              <span className="text-danger">
                {'\u{274C}'} tests are failing
              </span>
            )}
            {ciState === 'disabled' && '\u{00a0}'}
          </p>
        </div>
      </div>
      <Tabs active={activeTab} onActivate={setActiveTab} />
      {activeTab === 'main' && (
        <Main
          {...{
            repoName,
            currentBranch,

            path,
            onPathChange,
            files: filesWithCommits,
            previewFile,
            currentFile,
            //
            hasRepo,
            progress,
            onClone,
          }}
        />
      )}
    </div>
  );
}
