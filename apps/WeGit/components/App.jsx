// Imports
// =============================================================================

import React, { memo, useEffect, useCallback, useState } from 'react';

import useGit from './useGit';
import useFs from './useFs';

import Tabs from './Tabs';
import Main from './Main';
import Settings from './Settings';
import Progressbar from './Progressbar';

// Main
// =============================================================================

export default function App({ AppShell }) {
  const [activeTab, setActiveTab] = useState('main');
  const [basePath, setBasePath] = useState('/');
  const onPathChange = useCallback(path => setBasePath(path), [setBasePath]);

  const ciState = 'disabled';
  const {
    isReady: isFsReady,
    fs,
    onFsUpdate,
    hasRepo,
    files: fsFiles,
    previewFile,
    currentFile,
    path,
  } = useFs({
    path: basePath,
  });
  const {
    isReady,
    isLocked,
    files,

    progress,

    repoName,
    onChangeRepoName,
    currentBranch,
    lastCommitHolder,

    onClone,
    onReset,
  } = useGit({
    fs,
    isFsReady,
    path,
    files: fsFiles,
    hasRepo,
    onFsUpdate,
    AppShell,
  });

  if (!isReady) return null;
  return (
    <>
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
              lastCommitHolder,

              path,
              onPathChange,
              files,
              previewFile,
              currentFile,
              //
              hasRepo,
              progress,
              onClone,
            }}
          />
        )}
        {activeTab === 'settings' && (
          <Settings {...{ repoName, onChangeRepoName, onReset }} />
        )}
      </div>
      <Progressbar progress={progress} isLocked={isLocked} />
    </>
  );
}
