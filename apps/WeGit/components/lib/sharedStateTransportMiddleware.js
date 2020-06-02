// Imports
// =============================================================================

import gitHelpers from 'wegit-lib/utils/gitHelpers';

// Main
// =============================================================================

module.exports = ({
  fs,
  git,
  gitInternals,
  dir = '.',
  onUpdate,
  setSharedStateAfetrUpdate,

  /*setIsLocked,
  getIsLocked,
  setProgressPrefix,
  getProgressPrefix,
  onProgress,
  onUpdate,*/
}) => ({ send, onMessage, ...args }) => {
  const helpers = gitHelpers({
    fs,
    git,
    gitInternals,
    dir,
  });

  let resolveFetch = undefined;
  const nextSend = (userId, message, options) => {
    return send(userId, message, options);
  };

  const nextOnMessage = async message => {
    const { type, payload } = message;

    if (type === 'sync:fetch') {
      const { refDiff } = message.payload;
      const objectBundle = await helpers.createObjectBundle(refDiff);

      await send(message.path[0], {
        type: 'sync:fetchResponse',
        payload: {
          diffBundle: {
            refDiff,
            objectBundle,
          },
        },
      });
      return;
    } else if (type === 'sync:fetchResponse') {
      const { diffBundle } = message.payload;
      await helpers.applyDiffBundle(diffBundle);
      resolveFetch();
      return;
    }
    return onMessage(message);
  };

  const synchronize = async (nextSharedState, id) => {
    const { refs } = nextSharedState;

    const refDiff = await Promise.all(
      refs.map(async rh => {
        let hasOid;

        try {
          hasOid = await git.resolveRef({ dir, ref: rh.ref });
        } catch (e) {
          //
        }
        return {
          ref: rh.ref,
          wantOid: rh.oid,
          hasOid,
        };
      }),
    );
    /*
    const oidRanges = refDiff
      .filter(r => r.hasOid !== r.wantOid)
      .map(r => ({
        wantOid: r.wantOid,
        hasOid: r.hasOid,
      }));*/

    await send(id, {
      type: 'sync:fetch',
      payload: { refDiff },
    });
    await new Promise(resolve => (resolveFetch = resolve));
    setSharedStateAfetrUpdate(nextSharedState);
    onUpdate();
  };

  return { send: nextSend, onMessage: nextOnMessage, synchronize, ...args };
};
