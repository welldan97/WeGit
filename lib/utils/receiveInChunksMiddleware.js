// Imports
// =============================================================================

const nanoid = require('nanoid');

// Main
// =============================================================================

const MAX_SIZE = 10000;

module.exports = ({ send, onMessage }) => {
  const receivedChunks = {};

  const receiveChunk = (message, { onProgress = () => {}, ...options }) => {
    const {
      path: [userId],
      payload: { id, chunkBody, chunkNo, chunksCount },
    } = message;
    if (!receivedChunks[id]) receivedChunks[id] = '';
    receivedChunks[id] += chunkBody;
    onProgress({
      phase: 'Receiving',
      loaded: chunkNo,
      total: chunksCount - 1,
      lengthComputable: true,
    });

    if (chunkNo !== chunksCount - 1)
      send(userId, { type: 'nextChunk', payload: { id } });
    else {
      const parsedMessage = JSON.parse(receivedChunks[id]);
      onMessage({ ...message, ...parsedMessage }, options);
      delete receivedChunks[id];
    }
  };

  //----------------------------------------------------------------------------

  const nextSend = (userId, message, options = {}) => {
    if (message.type === 'chunks') return; // TODO
    if (message.type === 'nextChunk') return; // TODO
    send(userId, message, options);
  };

  const nextOnMessage = (message, options = {}) => {
    if (message.type === 'chunks') return receiveChunk(message, options);
    else return onMessage(message, options);
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
