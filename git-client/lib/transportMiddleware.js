#!/usr/bin/env node

// Imports
// =============================================================================

const cp = require('child_process');
const gitHelpers = require('wegit-lib/utils/gitHelpers');

// Utils
// =============================================================================

const createRef = async ({ sha, ref }) =>
  new Promise(resolve => {
    const gitProcess = cp.spawn('git', ['update-ref', ref, sha]);

    gitProcess.on('exit', () => resolve());
  });

// Handlers
// =============================================================================

let distRefObjects = undefined;
let srcRefObjects = undefined;

const getSendHandler = ({ fs, pfs, git, gitInternals, send }) => ({
  async fetch(userId, message) {
    const { payload } = message;
    const { refs } = payload;
    await Promise.all(refs.map(({ sha, ref }) => createRef({ sha, ref })));
    send(userId, message);
  },

  async push(userId, message) {
    const { fromRef, toRef } = message.payload;
    const fromOid = srcRefObjects.find(o => o.ref === fromRef).sha;
    const toOid = distRefObjects.find(o => o.ref === toRef).sha;
    const objectHolders = await gitHelpers({
      fs,
      pfs,
      git,
      gitInternals,
    }).createBundle({
      hasOid: toOid,
      wantOid: fromOid,
    });

    send(userId, {
      ...message,
      payload: {
        from: { ref: fromRef, oid: fromOid },
        to: { ref: toRef, oid: toOid },
        objectHolders,
      },
    });
  },
});

const getOnMessageHandler = ({ onMessage }) => ({
  async onFetch(message) {
    const { payload } = message;
    const { contents, type } = payload;
    if (type !== 'pack') throw new Error('Not implemented');

    const gitProcess = cp.spawn('git', [
      'index-pack',
      '--stdin',
      '-v',
      '--fix-thin',
    ]);

    gitProcess.on('exit', () => {
      onMessage(message);
    });

    gitProcess.stdin.write(
      Buffer.from(Uint8Array.from(contents).buffer),
      () => {
        gitProcess.stdin.end();
      },
    );
  },

  onList(message) {
    const { payload } = message;
    if (!message.payload.forPush) return onMessage(message);

    const gitProcess = cp.spawn('git', ['show-ref', '--head']);

    gitProcess.stdout.on('readable', () => {
      const value = gitProcess.stdout.read();
      if (!value) return;

      distRefObjects = payload.refs;
      srcRefObjects = value
        .toString()
        .trim()
        .split('\n')
        .map(l => {
          const [sha, ref] = l.split(' ');
          return { sha, ref };
        });

      return onMessage(message);
    });
  },
});

// Main
// =============================================================================

module.exports = ({ fs, pfs, git, gitInternals }) => ({ send, onMessage }) => {
  const nextSend = async (userId, message) => {
    console.warn('->', message);

    const handler = getSendHandler({ fs, pfs, git, gitInternals, send });
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

  const nextOnMessage = async message => {
    console.warn('<-', message);

    const handler = getOnMessageHandler({
      fs,
      pfs,
      git,
      gitInternals,
      onMessage,
    });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetchResponse': {
        await handler.onFetch(message);
        return;
      }
      case 'listResponse': {
        await handler.onList(message);
        return;
      }
      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
