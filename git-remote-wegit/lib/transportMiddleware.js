// Imports
// =============================================================================

const path = require('path');
const gitHelpers = require('wegit-lib/utils/gitHelpers');

// Utils
// =============================================================================

// Handlers
// =============================================================================

let distRefObjects = undefined;
let srcRefObjects = undefined;

const fetchDiffBundle = {
  refDiff: undefined,
  objectBundle: undefined,
};

const getSendHandler = ({
  fs,

  git,
  gitInternals,
  dir = '.',
  send,
  onError,
}) => {
  const helpers = gitHelpers({
    fs,

    git,
    gitInternals,
    dir,
  });

  return {
    async fetch(userId, message) {
      const { payload } = message;
      const { refHolders } = payload;

      fetchDiffBundle.refDiff = await Promise.all(
        refHolders.map(async rh => {
          let hasOid;

          try {
            hasOid = await git.resolveRef({ dir, ref: rh.ref });
          } catch (e) {}
          return {
            ref: rh.ref,
            wantOid: rh.oid,
            hasOid,
          };
        }),
      );

      const oidRanges = fetchDiffBundle.refDiff.map(r => ({
        wantOid: r.wantOid,
        hasOid: r.hasOid,
      }));

      return send(userId, {
        type: message.type,
        payload: { oidRanges },
      });
    },

    async push(userId, message, options) {
      const { fromRef, toRef } = message.payload;
      const wantOid = srcRefObjects.find(o => o.ref === fromRef).oid;
      const hasOid = (distRefObjects.find(o => o.ref === toRef) || {}).oid;
      const objectBundle = await helpers.createObjectBundle([
        {
          hasOid,
          wantOid,
        },
      ]);
      await send(
        userId,
        {
          type: message.type,
          payload: {
            diffBundle: {
              refDiff: [{ ref: toRef, hasOid, wantOid }],
              objectBundle,
            },
          },
        },
        options,
      );
      return;
    },
  };
};

const getOnMessageHandler = ({
  fs,

  git,
  gitInternals,
  dir = '.',
  onMessage,
  options,
  remote,
  url,
  onError,
}) => {
  const helpers = gitHelpers({
    fs,

    git,
    gitInternals,
    dir,
  });

  return {
    async onFetch(message) {
      fetchDiffBundle.objectBundle = message.payload.objectBundle;

      await helpers.applyObjectBundle(fetchDiffBundle.objectBundle);

      return onMessage(message, options);
    },

    async onList(message, onProgress) {
      const { payload } = message;
      if (!message.payload.forPush) {
        onProgress({
          phase: 'Preparing',
          loaded: 0,
          lengthComputable: false,
          phaseNo: 1,
          phasesTotal: 2,
        });
        return onMessage(message);
      } else {
        onProgress({
          phase: 'Preparing',
          loaded: 0,
          lengthComputable: false,
          phaseNo: 1,
          phasesTotal: 3,
        });
      }

      srcRefObjects = await helpers.listRefs();
      distRefObjects = payload.refs;

      return onMessage(message, options);
    },

    onBusy() {
      onError('Could not connect, try again later');
    },
  };
};

// Main
// =============================================================================

module.exports = ({
  fs,
  dir,
  git,
  gitInternals,
  remote,
  url,
  onError,
  onProgress,
  DEBUG,
}) => ({ send, onMessage, ...args }) => {
  const nextSend = async (userId, message, options) => {
    const handler = getSendHandler({
      fs,
      dir,
      git,
      gitInternals,
      send,
      remote,
      url,
      onError,
    });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:') || rawType === 'transport:status')
      return send(userId, message, options);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetch': {
        return handler.fetch(userId, message, options);
      }

      case 'push': {
        return handler.push(userId, message, options);
      }
      default:
        return send(userId, message, options);
    }
  };

  const nextOnMessage = async (message, options = {}) => {
    const handler = getOnMessageHandler({
      fs,
      dir,
      git,
      gitInternals,
      onMessage,
      options,
      remote,
      url,
      onError,
    });
    const { type: rawType } = message;

    if (
      !rawType.startsWith('transport:') ||
      rawType === 'transport:statusResponse'
    )
      return onMessage(message, options);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetchResponse':
        return void (await handler.onFetch(message));
      case 'listResponse':
        return void (await handler.onList(message, onProgress));
      case 'busy':
        return void (await handler.onBusy());
      default:
        return onMessage(message, options);
    }
  };

  return { ...args, send: nextSend, onMessage: nextOnMessage };
};
