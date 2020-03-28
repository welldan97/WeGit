// Imports
// =============================================================================

// Utils
// =============================================================================

const listRefs = ({ fs, git, gitInternals }) => async () => {
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

const getHandler = ({ fs, pfs, git, gitInternals, send }) => ({
  async capabilites(message) {
    send(message.path[0], {
      type: 'transport:capabilitiesResponse',
      payload: { capabilities: ['fetch', 'push'] },
    });
  },

  async list(message) {
    const forPush = message.payload.forPush;

    const refs = await listRefs({ fs, git, gitInternals })();
    send(message.path[0], {
      type: 'transport:listResponse',
      payload: { refs, forPush },
    });
  },

  async fetch(message) {
    // TODO: redo
    const sha = message.payload.refs[0].sha;
    const { source } = await git.readObject({
      dir: '/',
      oid: sha,
      format: 'deflated',
    });

    if (source.startsWith('objects/pack')) {
      const packContents = await pfs.readFile('.git/' + source);
      send(message.path[0], {
        type: 'transport:fetchResponse',
        payload: {
          contents: Array.from(packContents),
          type: 'pack',
        },
      });
    } else throw new Error('Not Implemented: it is not an pack');
  },

  async push(message) {
    const ArrayToString = array =>
      new TextDecoder().decode(Uint8Array.from(array));

    const writeObjectHolder = async objectHolder => {
      const { type, object } = objectHolder;
      if (type === 'blob') {
        await git.writeBlob({ dir: '/', blob: Uint8Array.from(object) });
      } else if (type === 'tree') {
        /*
        const parsedTree = ArrayToString(object)
          .toString()
          .trim()
          .split('\n')
          .map(row => {
            const [mode, type, sha, path] = row.split(/\t| /);
            return { mode, type, sha, path };
          });*/

        await git.writeTree({ dir: '/', tree: objectHolder.parsed.entries });
      } else if (type === 'commit') {
        git.writeCommit({ dir: '/', commit: ArrayToString(object) });
      } else {
        throw new Error('Not Implemented');
      }
    };

    const { from, to, objectHolders } = message.payload;
    await Promise.all(objectHolders.map(writeObjectHolder));
    await git.writeRef({
      dir: '/',
      ref: from.ref,
      value: from.oid,
      force: true,
    });
    await git.fastCheckout({ dir: '/', ref: 'master' });

    send(message.path[0], {
      type: 'transport:pushResponse',
      payload: {
        from,
        to,
      },
    });
  },
});

// Main
// =============================================================================

module.exports = ({ pfs, fs, git, gitInternals }) => ({ send, onMessage }) => {
  const handler = getHandler({ fs, pfs, git, gitInternals, send });

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
