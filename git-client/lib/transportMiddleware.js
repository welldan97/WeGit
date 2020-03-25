#!/usr/bin/env node

// Imports
// =============================================================================

const cp = require('child_process');

// Utils
// =============================================================================

const createRef = async ({ sha, ref }) =>
  new Promise(resolve => {
    const gitProcess = cp.spawn('git', ['update-ref', ref, sha]);

    gitProcess.on('exit', () => resolve());
  });

// Handlers
// =============================================================================

const getSendHandler = ({ send }) => ({
  async fetch(userId, message) {
    const { payload } = message;
    const { refs } = payload;
    await Promise.all(refs.map(({ sha, ref }) => createRef({ sha, ref })));
    send(userId, message);
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
});

// Main
// =============================================================================

module.exports = ({ send, onMessage }) => {
  const nextSend = async (userId, message) => {
    console.warn('->', message);

    const handler = getSendHandler({ send });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:')) return send(userId, message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetch': {
        await handler.fetch(userId, message);
        return;
      }
      default:
        return send(userId, message);
    }
  };

  const nextOnMessage = async message => {
    console.warn('<-', message);

    const handler = getOnMessageHandler({ onMessage });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetchResponse': {
        await handler.onFetch(message);
        return;
      }
      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
