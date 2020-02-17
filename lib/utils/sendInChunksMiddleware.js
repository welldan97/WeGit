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
      onMessage(parsedMessage);
      delete receivedChunks[id];
    }
  };

  //----------------------------------------------------------------------------

  const nextSend = (userId, message) => {
    if (message.type === 'chunks') return; // TODO
    if (message.type === 'nextChunk') return; // TODO

    const messageInString = JSON.stringify(message);

    if (messageInString.length > MAX_SIZE)
      sendInChunks(userId, messageInString);
    else send(userId, message);
  };

  const nextOnMessage = message => {
    if (message.type === 'chunks') return receiveChunk(message);
    else if (message.type === 'nextChunk') sendNextChunk(message);
    else return onMessage(message);
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
