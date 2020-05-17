// Imports
// =============================================================================

import gitHelpers from 'wegit-lib/utils/gitHelpers';

// Handlers
// =============================================================================

const getHandler = ({
  fs,
  git,
  gitInternals,
  setIsLocked,
  getIsLocked,
  setProgressPrefix,
  getProgressPrefix,
  dir = '.',
  send,
  onProgress,
  onFsUpdate,
}) => {
  const helpers = gitHelpers({
    fs,
    git,
    gitInternals,
    dir,
  });

  return {
    async status(message) {
      send(message.path[0], {
        type: 'transport:statusResponse',
        payload: { isReady: !getIsLocked() },
      });
    },

    async capabilites(message) {
      if (getIsLocked())
        return void send(message.path[0], {
          type: 'transport:busy',
          payload: {},
        });

      setIsLocked(true);
      send(message.path[0], {
        type: 'transport:capabilitiesResponse',
        payload: { capabilities: ['fetch', 'push'] },
      });
    },

    async list(message) {
      const { forPush } = message.payload;
      setProgressPrefix(forPush ? 'Pushing' : 'Pulling');

      const refs = await helpers.listRefs();

      if (getProgressPrefix() === 'Pulling' && refs.length) {
        onProgress({
          phase: `${getProgressPrefix()}: Preparing`,
          loaded: 0,
          lengthComputable: false,
          phaseNo: 1,
          phasesTotal: 2,
        });
      } else if (getProgressPrefix() === 'Pushing') {
        onProgress({
          phase: `${getProgressPrefix()}: Preparing`,
          loaded: 0,
          lengthComputable: false,
          phaseNo: 1,
          phasesTotal: 4,
        });
      } else {
        setProgressPrefix(undefined);
        onProgress(undefined);
        setIsLocked(false);
      }

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
                phase: `${getProgressPrefix()}: Sending`,
                phaseNo: 2,
                phasesTotal: 2,
              },
            );
          },
        },
      );
      setProgressPrefix(undefined);
      setIsLocked(false);
    },

    async push(message) {
      const { diffBundle } = message.payload;
      await helpers.applyDiffBundle(diffBundle);

      await send(message.path[0], {
        type: 'transport:pushResponse',
        payload: {
          refDiff: diffBundle.refDiff,
        },
      });

      onFsUpdate();
      setProgressPrefix(undefined);
      onProgress(undefined);
      setIsLocked(false);
    },

    async abort(message) {
      setProgressPrefix(undefined);
      onProgress(undefined);
      setIsLocked(false);
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
  setProgressPrefix,
  getProgressPrefix,
  onProgress,
  onFsUpdate,
}) => ({ send, onMessage }) => {
  const handler = getHandler({
    fs,
    git,
    gitInternals,
    setIsLocked,
    getIsLocked,
    setProgressPrefix,
    getProgressPrefix,
    send,
    onProgress,
    onFsUpdate,
  });

  const nextSend = (userId, message, options) => {
    return send(userId, message, options);
  };

  const nextOnMessage = async message => {
    const { type: rawType, payload } = message;
    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'status':
        return await handler.status(message);
      case 'capabilities':
        return await handler.capabilites(message);
      case 'list':
        return await handler.list(message);
      case 'fetch':
        return await handler.fetch(message);
      case 'push':
        return await handler.push(message);
      case 'abort':
        return await handler.abort(message);

      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
