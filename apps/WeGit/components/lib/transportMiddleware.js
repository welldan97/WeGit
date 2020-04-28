// Imports
// =============================================================================

import gitHelpers from 'wegit-lib/utils/gitHelpers';

// Utils
// =============================================================================

const listRefs = ({ fs, git, gitInternals, helpers }) => async () => {
  const x = await helpers.hasRepo();
  if (!(await helpers.hasRepo())) return [];
  const refs = [
    'HEAD',
    ...(await gitInternals.GitRefManager.listRefs({
      fs,
      gitdir: '.git',
      filepath: `refs`,
    })).map(r => `refs/${r}`),
  ];
  const value = await Promise.all(
    refs.map(async ref => {
      const sha = await git.resolveRef({ dir: '/', ref });
      return { sha, ref };
    }),
  );

  return value;
};

// Handlers
// =============================================================================

const getHandler = ({ fs, git, gitInternals, dir = '.', send }) => {
  const helpers = gitHelpers({
    fs,
    git,
    gitInternals,
    dir,
  });

  return {
    async capabilites(message) {
      send(message.path[0], {
        type: 'transport:capabilitiesResponse',
        payload: { capabilities: ['fetch', 'push'] },
      });
    },

    async list(message) {
      const forPush = message.payload.forPush;

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
      send(message.path[0], {
        type: 'transport:fetchResponse',
        payload: { objectBundle },
      });
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

module.exports = ({ fs, git, gitInternals }) => ({ send, onMessage }) => {
  const handler = getHandler({ fs, git, gitInternals, send });

  const nextSend = (userId, message) => {
    return send(userId, message);
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
