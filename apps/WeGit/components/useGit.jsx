// Imports
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import * as git from 'isomorphic-git';
import * as gitInternals from 'isomorphic-git/dist/internal.umd.min.js';
import EventEmitter from 'eventemitter3';

import gitHelpers from './lib/gitHelpers';
import transportMiddleware from './lib/transportMiddleware';

// Main
// =============================================================================

export default ({ fs, hasRepo, onFsUpdate, AppShell }) => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState();
  const emitterRef = useRef();

  const [currentBranch, setCurrentBranch] = useState();
  const [helpers, setHelpers] = useState({});
  useEffect(() => {
    (async () => {
      if (!fs) return;
      if (isReady) return;
      emitterRef.current = new EventEmitter();
      emitterRef.current.on('progress', nextProgress =>
        setProgress(nextProgress),
      );

      git.plugins.set('fs', fs);
      git.plugins.set('emitter', emitterRef.current);
      window.git = git;
      window.gitInternals = gitInternals;

      const nextHelpers = gitHelpers({ git, gitInternals, fs });
      setHelpers(nextHelpers);

      const { onMessage } = transportMiddleware({ fs, git, gitInternals })({
        onMessage: message => {
          console.log(message, '!!!!!!!');
        },
        send: (userId, message) => {
          AppShell.send(userId, message);
        },
      });

      AppShell.on('message', onMessage);
      setIsReady(true);
    })();
  }, [fs, isReady]);

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
