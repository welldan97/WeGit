// Imports
// =============================================================================

import React, { memo, useCallback, useState } from 'react';

import NoRepo from './NoRepo';
import Repo from './Repo';

// Main
// =============================================================================

export default function Main({
  repoName,
  path,
  onPathChange,
  files,
  previewFile,
  currentFile,
  //
  hasRepo,
  progress,
  onClone,
}) {
  return (
    <>
      {hasRepo || <NoRepo progress={progress} onClone={onClone} />}
      {hasRepo && (
        <Repo
          {...{
            repoName,
            path,
            onPathChange,
            files,
            previewFile,
            currentFile,
          }}
        />
      )}
    </>
  );
}
