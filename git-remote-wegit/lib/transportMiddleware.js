#!/usr/bin/env node

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

      send(userId, {
        type: message.type,
        payload: { oidRanges },
      });
    },

    async push(userId, message) {
      const { fromRef, toRef } = message.payload;
      const wantOid = srcRefObjects.find(o => o.ref === fromRef).oid;
      const hasOid = (distRefObjects.find(o => o.ref === toRef) || {}).oid;
      const objectBundle = await helpers.createObjectBundle([
        {
          hasOid,
          wantOid,
        },
      ]);
      send(userId, {
        type: message.type,
        payload: {
          diffBundle: {
            refDiff: [{ ref: toRef, hasOid, wantOid }],
            objectBundle,
          },
        },
      });
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
      }

      srcRefObjects = await helpers.listRefs();
      distRefObjects = payload.refs;

      return onMessage(message, options);
    },

    onBusy() {
      onError('The client is busy');
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
}) => ({ send, onMessage }) => {
  const nextSend = async (userId, message) => {
    if (DEBUG) console.warn('->', message);

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

    if (!rawType.startsWith('transport:')) return send(userId, message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetch': {
        await handler.fetch(userId, message);
        return;
      }

      case 'push': {
        await handler.push(userId, message);
        return;
      }
      default:
        return send(userId, message);
    }
  };

  const nextOnMessage = async (message, options = {}) => {
    if (DEBUG) console.warn('<-', message);

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

    if (!rawType.startsWith('transport:')) return;
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

  return { send: nextSend, onMessage: nextOnMessage };
};
