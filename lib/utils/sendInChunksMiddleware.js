// Imports
// =============================================================================

const nanoid = require('nanoid');

// Main
// =============================================================================

const MAX_SIZE = 10000;

module.exports = ({ send, onMessage, ...args }) => {
  const senders = {};
  const promises = {};
  const progresses = {};
  const receivedChunks = {};

  const sender = function*(id, userId, messageInString, options) {
    const chunksCount = Math.ceil(messageInString.length / MAX_SIZE);

    for (let i = 0; i < chunksCount; i++) {
      const chunkBody = messageInString.slice(i * MAX_SIZE, (i + 1) * MAX_SIZE);

      send(
        userId,
        {
          type: 'chunks',
          payload: {
            id,
            chunkBody,
            chunkNo: i,
            chunksCount,
          },
        },
        options,
      );
      progresses[id]({
        phase: 'Sending',
        loaded: i,
        total: chunksCount - 1,
        lengthComputable: true,
      });
      if (i < chunksCount - 1) yield;
    }
    delete senders[id];
    progresses[id](undefined);
    delete progresses[id];
    promises[id]();
    delete promises[id];
  };

  const sendInChunks = (
    userId,
    messageInString,
    { onProgress, ...options },
  ) => {
    const id = nanoid();
    progresses[id] = onProgress;
    senders[id] = sender(id, userId, messageInString, options);
    senders[id].next();
    return new Promise(resolve => {
      promises[id] = resolve;
    });
  };

  const sendNextChunk = message => {
    const { id } = message.payload;
    senders[id].next();
  };

  //----------------------------------------------------------------------------

  const nextSend = (
    userId,
    message,
    { onProgress = () => {}, ...options } = {},
  ) => {
    const messageInString = JSON.stringify(message);

    if (message.type === 'chunks') return send(userId, message, options);
    if (message.type === 'nextChunk') return send(userId, message, options);
    if (messageInString.length <= MAX_SIZE)
      return send(userId, message, options);

    return sendInChunks(userId, messageInString, { onProgress, ...options });
  };

  const nextOnMessage = (message, options = {}) => {
    if (message.type !== 'nextChunk') return onMessage(message, options);

    sendNextChunk(message);
  };

  return { ...args, send: nextSend, onMessage: nextOnMessage };
};
