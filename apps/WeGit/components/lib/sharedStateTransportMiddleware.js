// Imports
// =============================================================================

import gitHelpers from 'wegit-lib/utils/gitHelpers';

import { promisify } from 'util';

// Main
// =============================================================================

module.exports = ({
  fs,
  git,
  gitInternals,
  dir = '.',
  onUpdate,
  setSharedStateAfterUpdate,
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

    if (refs.length) {
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

      await send(id, {
        type: 'sync:fetch',
        payload: { refDiff },
      });
      await new Promise(resolve => (resolveFetch = resolve));
    } else {
      const readdir = promisify(fs.readdir);
      const lstat = promisify(fs.lstat);
      const unlink = promisify(fs.unlink);
      const rmdir = promisify(fs.rmdir);

      // FIXME: copypasta, duplicate with onReset
      const exists = ({ fs }) => async path => {
        const lstat = promisify(fs.lstat);

        try {
          await lstat(path);
          return true;
        } catch (e) {
          return false;
        }
      };

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
    }

    setSharedStateAfterUpdate(nextSharedState);
    onUpdate();
  };

  return { send: nextSend, onMessage: nextOnMessage, synchronize, ...args };
};
