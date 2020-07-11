// Imports
// =============================================================================

import React, { memo, useEffect, useCallback, useState } from 'react';

import useGit from './useGit';
import useFs from './useFs';

import Tabs from './Tabs';

import Main from './Main';
import PullRequests from './PullRequests';
import CiCd from './CiCd';
import Settings from './Settings';

import Progressbar from './Progressbar';

// Main
// =============================================================================

export default function App({ AppShell }) {
  const [activeTab, setActiveTab] = useState('ciCd');
  const [basePath, setBasePath] = useState('/');
  const onPathChange = useCallback(path => setBasePath(path), [setBasePath]);

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
    branches,
    onChangeBranch,
    lastCommitHolder,
    commitHoldersLog,
    pullRequests,
    onCreatePullRequest,
    onDeletePullRequest,
    onMergePullRequest,

    ciCd,
    ciCdState,

    onClone,
    onReset,

    libHelpers,
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

  let testsState = 'disabled';
  if (
    lastCommitHolder &&
    ciCdState?.tests?.find?.(t => t.oid === lastCommitHolder.oid)
  ) {
    testsState = 'success';
  }
  if (
    ciCdState?.tests?.find?.(t => t.oid === lastCommitHolder?.oid)
      ?.failuresCount > 0
  ) {
    testsState = 'fail';
  }

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
              {testsState === 'success' && (
                <span className="text-success">
                  {'\u{2705}'} tests are passing
                </span>
              )}
              {testsState === 'fail' && (
                <span className="text-danger">
                  {'\u{274C}'} tests are failing
                </span>
              )}
              {testsState === 'disabled' && '\u{00a0}'}
            </p>
          </div>
        </div>
        <Tabs active={activeTab} onActivate={setActiveTab} />
        {activeTab === 'main' && (
          <Main
            {...{
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
              //
              hasRepo,
              progress,
              onClone,
            }}
          />
        )}

        {activeTab === 'pullRequests' && (
          <PullRequests
            {...{
              currentBranch,
              branches,
              pullRequests,
              onCreatePullRequest,
              onDeletePullRequest,
              onMergePullRequest,
              libHelpers,
            }}
          />
        )}
        {activeTab === 'ciCd' && (
          <CiCd {...{ ciCd, ciCdState, commitHoldersLog }} />
        )}
        {activeTab === 'settings' && (
          <Settings {...{ repoName, onChangeRepoName, onReset }} />
        )}
      </div>
      <Progressbar progress={progress} isLocked={isLocked} />
    </>
  );
}
