// Imports
// =============================================================================

const nanoid = require('nanoid');

// Main
// =============================================================================

const MAX_SIZE = 10000;

module.exports = ({ send, onMessage }) => {
  const receivedChunks = {};

  const receiveChunk = message => {
    const {
      path: [userId],
      payload: { id, chunkBody, chunkNo, chunksCount },
    } = message;
    if (!receivedChunks[id]) receivedChunks[id] = '';
    receivedChunks[id] += chunkBody;

    if (chunkNo !== chunksCount - 1)
      send(userId, { type: 'nextChunk', payload: { id } });
    else {
      const parsedMessage = JSON.parse(receivedChunks[id]);
      onMessage({ ...message, ...parsedMessage });
      delete receivedChunks[id];
    }
  };

  //----------------------------------------------------------------------------

  const nextSend = (userId, message) => {
    if (message.type === 'chunks') return; // TODO
    if (message.type === 'nextChunk') return; // TODO
    send(userId, message);
  };

  const nextOnMessage = message => {
    if (message.type === 'chunks') return receiveChunk(message);
    else return onMessage(message);
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
