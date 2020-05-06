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
const showError = name => alert(`Error: ${name}`);

export default ({
  isFsReady,
  fs,
  path,
  files,
  hasRepo,
  onFsUpdate,

  AppShell,
}) => {
  const [state, setState] = useState({
    version: 0,
    helpers: {},
    isGitReady: false,
    isReady: false,
    currentBranch: undefined,
    lastCommitHolder,
  });

  const onUpdate = () =>
    setState({
      ...state,
      version: state.version + 1,
    });

  const {
    version,
    helpers,
    isReady,
    isGitReady,
    currentBranch,
    lastCommitHolder,
    //
  } = state;

  const [progress, setProgress] = useState();
  const isLockedRef = useRef(false);
  const [isLocked, baseSetIsLocked] = useState(isLockedRef.current);
  const setIsLocked = value => {
    isLockedRef.current = value;
    baseSetIsLocked(value);
  };
  const getIsLocked = () => isLockedRef.current;
  const progressPrefixRef = useRef('');
  const emitterRef = useRef();

  // Init
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      if (!isFsReady) return;
      if (isGitReady) return;

      emitterRef.current = new EventEmitter();
      emitterRef.current.on('progress', nextProgress => {
        const phaseNos = {
          'Receiving objects': 2,
          'Resolving deltas': 3,
          'Updating workdir': 4,
        };

        setProgress({
          ...nextProgress,
          phase: progressPrefixRef.current + nextProgress.phase,
          phaseNo: phaseNos[nextProgress.phase] || '!!',
          phasesTotal: 4,
        });
      });

      git.plugins.set('fs', fs);
      git.plugins.set('emitter', emitterRef.current);
      window.git = git;
      window.gitInternals = gitInternals;

      const nextHelpers = gitHelpers({ git, gitInternals, fs });

      const { onMessage } = transportMiddleware({
        fs,
        git,
        gitInternals,
        setIsLocked,
        getIsLocked,
        onProgress: progress => setProgress(progress),
      })({
        onMessage: message => {
          console.log(message, '!!!!!!!');
        },
        send: (userId, message, options) =>
          AppShell.send(userId, message, options),
      });

      AppShell.on('message', onMessage);
      setState({
        ...state,
        helpers: nextHelpers,
        isGitReady: true,
      });
    })();
  }, [isFsReady, isGitReady]);

  // Files with commit info
  // ---------------------------------------------------------------------------

  const [filesWithCommits, setFilesWithCommits] = useState(files);
  useEffect(() => {
    setFilesWithCommits(files);
    if (!isGitReady) return;
    if (!hasRepo) return;
    if (!files.length) return;

    (async () =>
      setFilesWithCommits(await helpers.findFilesLastCommits(path, files)))();
  }, [files, isGitReady, hasRepo]);

  // Current Branch & Last commit
  // ---------------------------------------------------------------------------

  useEffect(() => {
    (async () => {
      if (!isGitReady) return;

      if (!hasRepo) {
        setState({
          ...state,
          currentBranch: undefined,
          lastCommitHolder: undefined,
          isReady: true,
        });
        return;
      }

      const nextCurrentBranch = await git.currentBranch({ dir: '.' });
      const nextLastCommitHolder = await helpers.getLastCommitHolder();

      setState({
        ...state,
        currentBranch: nextCurrentBranch,
        lastCommitHolder: nextLastCommitHolder,
        isReady: true,
      });
    })();
  }, [isGitReady, hasRepo]);

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
      phaseNo: 1,
      phasesTotal: 4,
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
      phaseNo: 1,
      phasesTotal: 1,
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
