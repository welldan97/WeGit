// Imports
// =============================================================================

const nanoid = require('nanoid');

// Main
// =============================================================================

const MAX_SIZE = 10000;

module.exports = ({ send, onMessage }) => {
  const senders = {};
  const receivedChunks = {};

  const sender = function*(id, userId, messageInString) {
    const chunksCount = Math.ceil(messageInString.length / MAX_SIZE);

    for (let i = 0; i < chunksCount; i++) {
      const chunkBody = messageInString.slice(i * MAX_SIZE, (i + 1) * MAX_SIZE);

      send(userId, {
        type: 'chunks',
        payload: {
          id,
          chunkBody,
          chunkNo: i,
          chunksCount,
        },
      });

      yield;
    }
    delete senders[id];
  };

  const sendInChunks = (userId, messageInString) => {
    const id = nanoid();
    senders[id] = sender(id, userId, messageInString);
    senders[id].next();
  };

  const sendNextChunk = message => {
    const { id } = message.payload;
    senders[id].next();
  };

  //----------------------------------------------------------------------------

  const nextSend = (userId, message) => {
    const messageInString = JSON.stringify(message);

    if (message.type === 'chunks') return send(userId, message);
    if (message.type === 'nextChunk') return send(userId, message);
    if (messageInString.length <= MAX_SIZE) return send(userId, message);

    sendInChunks(userId, messageInString);
  };

  const nextOnMessage = message => {
    if (message.type !== 'nextChunk') return onMessage(message);

    sendNextChunk(message);
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
