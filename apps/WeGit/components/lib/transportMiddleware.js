// Imports
// =============================================================================

const listRefs = ({ git, gitInternals }) => async () => {
  const refs = [
    'HEAD',
    ...(await gitInternals.GitRefManager.listRefs({
      fs: window.fs, //TODO
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

// Main
// =============================================================================

module.exports = ({ send, onMessage }) => {
  const nextSend = (userId, message) => {
    return send(userId, message);
  };

  const nextOnMessage = async message => {
    const { type: rawType, payload } = message;
    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'capabilities':
        send(message.path[0], {
          type: 'transport:capabilitiesResponse',
          payload: { capabilities: ['fetch', 'push'] },
        });
        return;
      case 'list': {
        const refs = await listRefs({ git, gitInternals })();
        send(message.path[0], {
          type: 'transport:listResponse',
          payload: { refs },
        });
        return;
      }
      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
