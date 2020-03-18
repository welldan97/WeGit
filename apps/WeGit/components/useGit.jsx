// Imports
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import * as git from 'isomorphic-git';
import * as gitInternals from 'isomorphic-git/dist/internal.umd.min.js';
import EventEmitter from 'eventemitter3';

import gitHelpers from './lib/gitHelpers';

// Main
// =============================================================================

export default ({ fs, hasRepo, onFsUpdate }) => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState();
  const emitterRef = useRef();

  const [currentBranch, setCurrentBranch] = useState();
  const [helpers, setHelpers] = useState({});

  useEffect(() => {
    (async () => {
      emitterRef.current = new EventEmitter();
      emitterRef.current.on('progress', nextProgress =>
        setProgress(nextProgress),
      );

      if (!fs) return;
      git.plugins.set('fs', fs);
      git.plugins.set('emitter', emitterRef.current);
      window.git = git;
      window.gitInternals = gitInternals;

      const { findFilesLastCommits } = gitHelpers({ git, gitInternals, fs });
      setHelpers({ findFilesLastCommits });

      setIsReady(true);
    })();
  }, [fs]);

  useEffect(() => {
    (async () => {
      if (!hasRepo) return;
      if (!isReady) return;
      const nextCurrentBranch = await git.currentBranch({ dir: '/' });

      setCurrentBranch(nextCurrentBranch);
    })();
  }, [hasRepo, isReady]);

  const onClone = async url => {
    setProgress({
      phase: 'Preparing for cloning',
      loaded: 0,
      lengthComputable: false,
    });
    await git.clone({
      dir: '/',
      corsProxy: 'https://cors.isomorphic-git.org',
      url,
    });
    setProgress(undefined);
    onFsUpdate();
  };

  return {
    isReady,
    onClone,
    progress,
    currentBranch,
    ...helpers,
  };
};
