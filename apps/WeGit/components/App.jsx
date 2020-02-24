// Imports.}
// =============================================================================

import React, { memo, useCallback, useState } from 'react';

import useGit from './useGit';

import useFs from './useFs';

import Main from './Main';

import NoRepo from './NoRepo';

// Main
// =============================================================================

export default function App() {
  const [path, setPath] = useState('.');
  const onPathChange = useCallback(path => setPath(path), [setPath]);

  const { fs, triggerFsUpdated, hasRepo, files, preview } = useFs({
    path,
  });

  const { isReady, onClone } = useGit({ fs, onChange: triggerFsUpdated });
  useGit({ fs, onChange: triggerFsUpdated });
  if (!isReady) return null;

  if (!hasRepo)
    return (
      <NoRepo
        {...{
          onClone,
        }}
      />
    );

  return (
    <Main
      {...{
        hasRepo,
        path,
        onPathChange,
        files,
        preview,
      }}
    />
  );
}
