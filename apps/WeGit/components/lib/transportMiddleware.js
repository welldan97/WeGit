// Imports
// =============================================================================

import gitHelpers from 'wegit-lib/utils/gitHelpers';

// Utils
// =============================================================================

const listRefs = ({
  fs,
  git,
  gitInternals,
  helpers,
  dir = '.',
}) => async () => {
  const x = await helpers.hasRepo();
  if (!(await helpers.hasRepo())) return [];
  const refs = [
    'HEAD',
    ...(await gitInternals.GitRefManager.listRefs({
      fs,

      // FIXME: should we use dir var here?
      gitdir: '.git',
      filepath: `refs`,
    })).map(r => `refs/${r}`),
  ];
  const value = await Promise.all(
    refs.map(async ref => {
      const sha = await git.resolveRef({ dir, ref });
      return { sha, ref };
    }),
  );

  return value;
};

// Handlers
// =============================================================================

const getHandler = ({
  fs,
  git,
  gitInternals,
  setIsLocked,
  getIsLocked,
  dir = '.',
  send,
  onProgress,
}) => {
  let currentWork;
  const helpers = gitHelpers({
    fs,
    git,
    gitInternals,
    dir,
  });

  return {
    async capabilites(message) {
      if (getIsLocked())
        return void send(message.path[0], {
          type: 'transport:busy',
        });

      setIsLocked(true);
      send(message.path[0], {
        type: 'transport:capabilitiesResponse',
        payload: { capabilities: ['fetch', 'push'] },
      });
    },

    async list(message) {
      const { forPush } = message.payload;
      currentWork = forPush ? 'Pushing' : 'Pulling';

      onProgress({
        phase: `${currentWork}: Preparing`,
        loaded: 0,
        lengthComputable: false,
        phaseNo: 1,
        phasesTotal: 2,
      });

      const refs = await listRefs({ fs, git, gitInternals, helpers })();
      send(message.path[0], {
        type: 'transport:listResponse',
        payload: { refs, forPush },
      });
    },

    async fetch(message) {
      const objectBundle = await helpers.createObjectBundle(
        message.payload.oidRanges,
      );

      await send(
        message.path[0],
        {
          type: 'transport:fetchResponse',
          payload: { objectBundle },
        },
        {
          onProgress: progress => {
            onProgress(
              progress && {
                ...progress,
                phase: `${currentWork}: Sending`,
                phaseNo: 2,
                phasesTotal: 2,
              },
            );
          },
        },
      );
      setIsLocked(false);
    },

    async push(message) {
      const { diffBundle } = message.payload;
      await helpers.applyDiffBundle(diffBundle);

      send(message.path[0], {
        type: 'transport:pushResponse',
        payload: {
          refDiff: diffBundle.refDiff,
        },
      });
    },
  };
};

// Main
// =============================================================================

module.exports = ({
  fs,
  git,
  gitInternals,
  setIsLocked,
  getIsLocked,
  onProgress,
}) => ({ send, onMessage }) => {
  const handler = getHandler({
    fs,
    git,
    gitInternals,
    setIsLocked,
    getIsLocked,
    send,
    onProgress,
  });

  const nextSend = (userId, message, options) => {
    return send(userId, message, options);
  };

  const nextOnMessage = async message => {
    const { type: rawType, payload } = message;
    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'capabilities':
        return await handler.capabilites(message);
      case 'list':
        return await handler.list(message);
      case 'fetch':
        return await handler.fetch(message);
      case 'push':
        return await handler.push(message);

      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
