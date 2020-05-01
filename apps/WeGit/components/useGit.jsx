// Imports
// =============================================================================

import { promisify } from 'util';
import { useEffect, useRef, useState } from 'react';
import * as git from 'isomorphic-git';
import * as gitInternals from 'isomorphic-git/dist/internal.umd.min.js';
import EventEmitter from 'eventemitter3';

import gitHelpers from './lib/gitHelpers';
import transportMiddleware from './lib/transportMiddleware';

// Utils
// =============================================================================

const exists = ({ fs }) => async path => {
  const lstat = promisify(fs.lstat);

  try {
    await lstat(path);
    return true;
  } catch (e) {
    return false;
  }
};

// Main
// =============================================================================

// TODO
const showError = name => alert(name);

export default ({
  isFsReady,
  fs,
  path,
  files,
  hasRepo,
  onFsUpdate,

  AppShell,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState();
  const [isLocked, setIsLocked] = useState(false);
  const progressPrefixRef = useRef('');
  const emitterRef = useRef();

  // Init
  // ---------------------------------------------------------------------------
  const [helpers, setHelpers] = useState({});
  useEffect(() => {
    (async () => {
      if (!isFsReady) return;
      if (isReady) return;
      emitterRef.current = new EventEmitter();
      emitterRef.current.on('progress', nextProgress =>
        setProgress({
          ...nextProgress,
          phase: progressPrefixRef.current + nextProgress.phase,
        }),
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
  }, [isFsReady, isReady]);

  // Files with commit info
  // ---------------------------------------------------------------------------

  const [filesWithCommits, setFilesWithCommits] = useState(files);
  useEffect(() => {
    setFilesWithCommits(files);
    if (!helpers.findFilesLastCommits) return;
    if (!hasRepo) return;

    (async () =>
      setFilesWithCommits(await helpers.findFilesLastCommits(path, files)))();
  }, [files, helpers.findFilesLastCommits]);

  // Current Branch & Last commit
  // ---------------------------------------------------------------------------

  const [currentBranch, setCurrentBranch] = useState();
  useEffect(() => {
    (async () => {
      if (!hasRepo) return;
      if (!isReady) return;
      const nextCurrentBranch = await git.currentBranch({ dir: '/' });

      setCurrentBranch(nextCurrentBranch);
    })();
  }, [hasRepo, isReady]);

  const [lastCommitHolder, setLastCommitHolder] = useState(undefined);
  useEffect(() => {
    if (!helpers.getLastCommitHolder) return;
    if (!hasRepo) return;

    (async () => setLastCommitHolder(await helpers.getLastCommitHolder()))();
    // TODO: Add version for update
  }, [helpers.getLastCommitHolder]);

  // Methods
  // ---------------------------------------------------------------------------

  const onClone = async url => {
    if (isLocked) return void showError('Repository is locked');
    setIsLocked(true);

    progressPrefixRef.current = 'Cloning: ';
    setProgress({
      phase: 'Cloning: Preparing',
      loaded: 0,
      lengthComputable: false,
    });
    await git.clone({
      dir: '/',
      corsProxy: 'https://cors.isomorphic-git.org',
      url,
    });
    progressPrefixRef.current = '';
    setProgress(undefined);
    onFsUpdate();

    setIsLocked(false);
  };

  const onReset = async () => {
    if (isLocked) return void showError('Repository is locked');
    setIsLocked(true);

    const readdir = promisify(fs.readdir);
    const lstat = promisify(fs.lstat);
    const unlink = promisify(fs.unlink);
    const rmdir = promisify(fs.rmdir);

    // FIXME: copypasta, probably better to remove indexdb

    setProgress({
      phase: 'Resetting',
      loaded: 0,
      lengthComputable: false,
    });

    const deleteFolderRecursive = async path => {
      if (path === '/' || exists({ fs })(path)) {
        await Promise.all(
          (await readdir(path)).map(async file => {
            const curPath = path === '/' ? '/' + file : path + '/' + file;
            if ((await lstat(curPath)).isDirectory())
              await deleteFolderRecursive(curPath);
            else await unlink(curPath);
          }),
        );

        if (path !== '/') await rmdir(path);
      }
    };
    await deleteFolderRecursive('/');
    setProgress(undefined);
    onFsUpdate();

    setIsLocked(false);
  };

  return {
    isReady,
    isLocked,
    progress,
    files: filesWithCommits,
    currentBranch,
    lastCommitHolder,
    onClone,
    onReset,
  };
};
