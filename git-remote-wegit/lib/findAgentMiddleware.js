// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = ({ isReadyPromise }) => ({ send, onMessage, ...args }) => {
  let isAgentFound = false;
  let findAgentResolve;
  let userIdsToProcess;
  const findAgent = new Promise(
    resolve => (findAgentResolve = (...args) => resolve(...args)),
  );

  const nextOnMessage = async (message, options = {}) => {
    const { type: rawType } = message;

    if (rawType !== 'transport:statusResponse')
      return onMessage(message, options);

    if (isAgentFound) return;
    if (message.payload.isReady) {
      findAgentResolve(message.path[0]);
    } else {
      userIdsToProcess--;
      if (userIdsToProcess === 0) findAgentResolve(undefined);
    }
  };

  isReadyPromise.then(meshState => {
    // NOTE: for now due locks, just ask first user
    const userIds = [
      meshState.connections
        .filter(c => c.state === 'connected')
        .filter(c => c.user && c.user.type === 'browser')
        .map(c => c.user.id)[0],
    ];

    userIdsToProcess = userIds.length;
    if (!userIds.length) return findAgentResolve(undefined);

    userIds.forEach(userId => {
      send(userId, {
        type: 'transport:status',
        payload: {},
      });
    });
  });
  return { ...args, send: send, onMessage: nextOnMessage, findAgent };
};
