// Imports
// =============================================================================

import React, { useState } from 'react';

import Create from './Create';
import Show from './Show';
import Main from './Main';

// Main
// =============================================================================

export default function PullRequest({
  currentBranch,
  branches,
  pullRequests,
  onCreatePullRequest,
  onDeletePullRequest,
  onMergePullRequest,
  libHelpers,
}) {
  const [state, setState] = useState({
    page: 'main',
    currentPullRequest: undefined,
  });

  const onCreate = () => {
    setState({ ...state, page: 'create' });
  };

  const onShow = pullRequest => {
    setState({ ...state, page: 'show', currentPullRequest: pullRequest });
  };

  const onCancel = () => {
    setState({ ...state, page: 'main' });
  };

  const onSubmit = pullRequest => {
    onCreatePullRequest(pullRequest);
    setState({ ...state, page: 'main' });
  };

  const onDelete = pullRequest => {
    onDeletePullRequest(pullRequest);
    setState({ ...state, page: 'main' });
  };

  const onMerge = pullRequest => {
    onMergePullRequest(pullRequest);
    setState({ ...state, page: 'main' });
  };

  return (
    <>
      {state.page === 'main' && (
        <Main onCreate={onCreate} onShow={onShow} pullRequests={pullRequests} />
      )}
      {state.page === 'create' && (
        <Create
          {...{
            currentBranch,
            branches,
            onCancel,
            onSubmit,
            libHelpers,
          }}
        />
      )}

      {state.page === 'show' && (
        <Show
          pullRequest={state.currentPullRequest}
          onCancel={onCancel}
          onDelete={onDelete}
          onMerge={onMerge}
        />
      )}
    </>
  );
}
