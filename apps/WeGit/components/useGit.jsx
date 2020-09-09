// Imports
// =============================================================================

import isEqual from 'lodash/fp/isEqual';
import { promisify } from 'util';
import { useEffect, useRef, useState } from 'react';
import * as git from 'isomorphic-git';
import * as gitInternals from 'isomorphic-git/dist/internal.umd.min.js';
import EventEmitter from 'eventemitter3';

import sharedVersionStateMiddleware from 'wegit-lib/utils/sharedVersionStateMiddleware';
import sharedSimpleStateMiddleware from 'wegit-lib/utils/sharedSimpleStateMiddleware';

import gitHelpers from './lib/gitHelpers';
import libGitHelpers from 'wegit-lib/utils/gitHelpers';

import transportMiddleware from './lib/transportMiddleware';
import sharedStateTransportMiddleware from './lib/sharedStateTransportMiddleware';

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
    libHelpers: {},
    isGitReady: false,
    isReady: false,
    currentBranch: undefined,
    branches: [],
    lastCommitHolder: undefined,
    commitHoldersLog: [],
    ciCd: undefined,
  });
  const {
    version,
    helpers,
    libHelpers,
    isReady,
    isGitReady,
    currentBranch,
    branches,
    lastCommitHolder,
    commitHoldersLog,

    ciCd,
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

  const setProgressPrefix = value => {
    progressPrefixRef.current = value;
  };
  const getProgressPrefix = () => progressPrefixRef.current;
  const emitterRef = useRef();

  // Shared Version State (repo itself)
  // ---------------------------------------------------------------------------

  const sharedStateBindingsRef = useRef();
  const [sharedState, baseSetSharedState] = useState({
    version:
      JSON.parse(localStorage.getItem('wegitVersion') || '{}').version || 0,
    refs: undefined,
  });
  const onSharedStateSynchronizing = (
    isSynchronizing,
    syncOutdated,
    syncTotal,
  ) => {
    setIsLocked(isSynchronizing);
    if (isSynchronizing)
      setProgress({
        phase: 'Synchronizing',
        loaded: syncTotal - syncOutdated,
        total: syncTotal,
        lengthComputable: true,
        phaseNo: 1,
        phasesTotal: 1,
      });
    else setProgress(undefined);
  };
  const sharedStateComparator = (a, b) => {
    return Math.sign(a.version - b.version);
  };

  const setSharedState = (nextSharedState, { force = false } = {}) => {
    localStorage.setItem(
      'wegitVersion',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('wegit') || '{}'),
        version: nextSharedState.version,
      }),
    );
    sharedStateBindingsRef.current.changeState(nextSharedState, { force });
    sharedStateBindingsRef.current.ready();
    baseSetSharedState(nextSharedState);
  };

  const setSharedStateAfterUpdate = nextSharedState => {
    localStorage.setItem(
      'wegitVersion',
      JSON.stringify({ version: nextSharedState.version }),
    );
    baseSetSharedState(nextSharedState);
  };

  useEffect(() => {
    if (!isGitReady) return;

    (async () => {
      const refs = await libHelpers.listRefs();

      setSharedState({
        ...sharedState,
        refs,
      });
    })();
  }, [isGitReady]);

  // Shared Simple State (repo metadata)
  // ---------------------------------------------------------------------------
  const initialSharedSimpleState =
    localStorage.getItem('wegitSimple') &&
    JSON.parse(localStorage.getItem('wegitSimple'));

  const [sharedSimpleState, baseSetSharedSimpleState] = useState(
    initialSharedSimpleState,
  );

  const sharedSimpleStateBindingsRef = useRef();

  const setSharedSimpleState = nextState => {
    localStorage.setItem(
      'wegitSimple',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('wegitSimple') || '{}'),
        ...nextState,
      }),
    );
    sharedSimpleStateBindingsRef.current.changeState(nextState);
    baseSetSharedSimpleState(nextState);
  };

  const changeSharedSimpleState = nextState => {
    localStorage.setItem(
      'wegitSimple',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('wegitSimple') || '{}'),
        ...nextState,
      }),
    );
    baseSetSharedSimpleState(nextState);
  };

  // Update
  // ---------------------------------------------------------------------------

  const onUpdateRef = useRef(undefined);

  useEffect(() => {
    onUpdateRef.current = ({
      shouldUpdateFs = true,
      shouldUpdateVersion = true,
      shouldUpdateSharedState = true,
      reset = false,
    } = {}) => {
      if (!state.isGitReady) return;

      if (shouldUpdateFs) onFsUpdate();

      if (shouldUpdateVersion)
        setState({
          ...state,
          version: state.version + 1,
        });

      if (shouldUpdateSharedState)
        (async () => {
          const refs = await libHelpers.listRefs();
          if (isEqual(refs, sharedState.refs)) return;

          setSharedState(
            {
              ...sharedState,
              version: reset ? 0 : sharedState.version + 1,
              refs,
            },
            { force: reset },
          );
        })();
    };
  }, [state, sharedState, onFsUpdate]);

  // Init
  // ---------------------------------------------------------------------------

  useEffect(() => {
    (async () => {
      if (!isFsReady) return;
      if (isGitReady) return;

      emitterRef.current = new EventEmitter();
      emitterRef.current.on('progress', nextProgress => {
        const phaseNos = {
          Pushing: {
            'Analyzing workdir': 3,
            'Updating workdir': 4,
          },
          Cloning: {
            'Receiving objects': 2,
            'Resolving deltas': 3,
            'Updating workdir': 4,
          },
        };
        if (!progressPrefixRef.current) return;
        setProgress(
          nextProgress && {
            ...nextProgress,
            phase: progressPrefixRef.current
              ? `${progressPrefixRef.current}: ${nextProgress.phase}`
              : nextProgress.phase,
            phaseNo:
              phaseNos[progressPrefixRef.current][nextProgress.phase] ||
              '1' /*TODO*/,
            phasesTotal: 4,
          },
        );
      });

      git.plugins.set('fs', fs);
      git.plugins.set('emitter', emitterRef.current);
      window.git = git;
      window.gitInternals = gitInternals;

      const nextHelpers = gitHelpers({ git, gitInternals, fs });
      const nextLibHelpers = libGitHelpers({
        fs,
        git,
        gitInternals,
        dir: '.',
      });
      const passedMiddleware = sharedStateTransportMiddleware({
        fs,
        git,
        gitInternals,
        onUpdate: () =>
          onUpdateRef.current({
            shouldUpdateSharedState: false,
          }),
        setSharedStateAfterUpdate,
      })({
        onMessage: message => {
          const { type, payload } = message;
          if (type === 'testsDone') onTestsDoneRef.current(message);
          //console.log(message, '!!!!!!!');
        },
        send: (userId, message, options) => {
          //console.log('[->]', message);
          return AppShell.send(userId, message, options);
        },
      });

      const {
        onMessage,
        sharedState: sharedStateBindings,
        sharedSimpleState: sharedSimpleStateBindings,
      } = transportMiddleware({
        fs,
        git,
        gitInternals,
        setIsLocked,
        getIsLocked,
        onProgress: progress => setProgress(progress),
        setProgressPrefix,
        getProgressPrefix,
        onUpdate: () => onUpdateRef.current(),
      })(
        sharedSimpleStateMiddleware({
          onChangeState: changeSharedSimpleState,

          initialState: sharedSimpleState,
          initialUsers: AppShell.users,
        })(
          sharedVersionStateMiddleware({
            onChangeState: passedMiddleware.synchronize,
            onSynchronizing: onSharedStateSynchronizing,
            stateComparator: sharedStateComparator,
            //onInnerStateChange: sharedState => console.log('SHARED', sharedState),

            initialState: sharedState,
            initialUsers: AppShell.users,
          })(passedMiddleware),
        ),
      );
      sharedStateBindingsRef.current = sharedStateBindings;
      sharedSimpleStateBindingsRef.current = sharedSimpleStateBindings;
      AppShell.on('saveUsers', users => {
        sharedStateBindings.saveUsers(users);
        sharedSimpleStateBindings.saveUsers(users);
      });
      AppShell.on(
        'message',
        (...args) => {
          //console.log('[<-]', ...args);
          return onMessage(...args);
        },
        {
          onProgress: progress => {
            if (getProgressPrefix() !== 'Pushing') return;
            setProgress(
              progress && {
                ...progress,
                phase: `${getProgressPrefix()}: ${progress.phase}`,
                phaseNo: 2,
                phasesTotal: 4,
              },
            );
          },
        },
      );
      setState({
        ...state,
        helpers: nextHelpers,
        libHelpers: nextLibHelpers,
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

  // Current branch, all branches, last commit
  // ---------------------------------------------------------------------------

  useEffect(() => {
    (async () => {
      if (!isGitReady) return;

      if (!hasRepo) {
        setState({
          ...state,
          currentBranch: undefined,
          branches: [],

          lastCommitHolder: undefined,
          commitHoldersLog: [],
          ciCd: undefined,

          isReady: true,
        });
        return;
      }

      const nextCurrentBranch = await git.currentBranch({ dir: '.' });
      const nextLastCommitHolder = await helpers.getLastCommitHolder();
      const branches = (await git.listBranches({ dir: '.' })).sort((a, b) =>
        a.localeCompare(b),
      );
      const nextCommitHoldersLog = await libHelpers.listCommitHolders(5);
      const readFile = promisify(fs.readFile);

      let ciCd;

      try {
        const packageJson = JSON.parse(await readFile(`/package.json`, 'utf8'));
        const tests =
          packageJson.weGit?.testsSrc &&
          (await readFile(packageJson.weGit.testsSrc, 'utf8'));

        const testsTarget =
          packageJson.weGit?.testsTargetSrc &&
          (await readFile(packageJson.weGit.testsTargetSrc, 'utf8'));

        const buildTarget =
          packageJson.weGit?.buildTargetSrc &&
          (await readFile(packageJson.weGit.buildTargetSrc, 'utf8'));

        const build =
          packageJson.weGit?.buildSrc &&
          (await readFile(packageJson.weGit.buildSrc, 'utf8'));

        ciCd = { build, buildTarget, tests, testsTarget };
      } catch (e) {}

      setState({
        ...state,
        currentBranch: nextCurrentBranch,
        branches,
        lastCommitHolder: nextLastCommitHolder,
        commitHoldersLog: nextCommitHoldersLog,
        ciCd,
        isReady: true,
      });
    })();
  }, [isGitReady, hasRepo, version]);

  // Methods
  // ---------------------------------------------------------------------------

  const onClone = async url => {
    if (isLocked) return void showError('Repository is locked');
    setIsLocked(true);

    progressPrefixRef.current = 'Cloning';
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
    onUpdateRef.current();
    onChangeRepoName(url.replace(/^.*\//, '').replace(/\..*$/, ''));
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
    onUpdateRef.current({ reset: true });
    setSharedSimpleState({
      name: undefined,
      pullRequests: undefined,
      ciCdState: undefined,
    });
    setIsLocked(false);
  };

  const onChangeBranch = async branch => {
    if (isLocked) return void showError('Repository is locked');
    setIsLocked(true);
    setProgress({
      phase: 'Changing branch',
      loaded: 0,
      lengthComputable: false,
      phaseNo: 1,
      phasesTotal: 1,
    });

    await git.checkout({ dir: '.', ref: branch });
    onUpdateRef.current({
      shouldUpdateSharedState: false,
    });

    setProgress(undefined);
    setIsLocked(false);
  };

  const onChangeRepoName = name => {
    if (isLocked) return void showError('Repository is locked');
    setSharedSimpleState({ ...(sharedSimpleState || {}), name });
  };

  const onCreatePullRequest = async pullRequest => {
    if (isLocked) return void showError('Repository is locked');
    setSharedSimpleState({
      ...(sharedSimpleState || {}),
      pullRequests: [...(sharedSimpleState?.pullRequests || []), pullRequest],
    });
  };

  const onDeletePullRequest = async pullRequest => {
    if (isLocked) return void showError('Repository is locked');
    setSharedSimpleState({
      ...(sharedSimpleState || {}),
      pullRequests: sharedSimpleState.pullRequests.filter(
        p => p.id !== pullRequest.id,
      ),
    });
  };

  const onMergePullRequest = async pullRequest => {
    if (isLocked) return void showError('Repository is locked');
    setIsLocked(true);
    setProgress({
      phase: 'Merging branch',
      loaded: 0,
      lengthComputable: false,
      phaseNo: 1,
      phasesTotal: 1,
    });

    await git.merge({
      dir: '.',
      ours: pullRequest.to,
      theirs: pullRequest.from,
    });

    setSharedSimpleState({
      ...(sharedSimpleState || {}),
      pullRequests: sharedSimpleState.pullRequests.filter(
        p => p.id !== pullRequest.id,
      ),
    });

    setProgress(undefined);
    setIsLocked(false);
    onUpdateRef.current();
  };

  // CI CD
  // ---------------------------------------------------------------------------

  const onTestsDoneRef = useRef();

  useEffect(() => {
    onTestsDoneRef.current = message => {
      const { type, payload } = message;

      if (isLocked) return void showError('Repository is locked');

      const prevCiCdState = sharedSimpleState?.ciCdState || { tests: [] };

      let nextTests = [
        ...prevCiCdState.tests.filter(t => t.oid !== payload.oid),
        payload,
      ];

      setSharedSimpleState({
        ...(sharedSimpleState || {}),
        ciCdState: {
          ...prevCiCdState,
          tests: nextTests,
        },
      });
      return;
    };
  }, [isLocked, sharedSimpleState]);

  const onBuild = source => {
    AppShell.createApp({ source });
  };

  return {
    isReady,
    isLocked,
    progress,
    files: filesWithCommits,
    repoName: sharedSimpleState?.name || '',
    pullRequests: sharedSimpleState?.pullRequests || [],
    onChangeRepoName,
    currentBranch,
    branches,
    onChangeBranch,
    lastCommitHolder,
    commitHoldersLog,

    onClone,
    onReset,

    onCreatePullRequest,
    onDeletePullRequest,
    onMergePullRequest,

    ciCd,
    ciCdState: sharedSimpleState?.ciCdState || {
      tests: [],
    },
    onBuild,

    libHelpers: state.libHelpers,
  };
};
