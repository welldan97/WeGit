// Imports
// =============================================================================

import isEqual from 'lodash/fp/isEqual';

// Main
// =============================================================================

const TIMEOUT = 2000;

module.exports = ({
  onChangeState = () => {},
  initialState,
  initialUsers,
} = {}) => ({ send, onMessage, ...args }) => {
  // State
  //--------------------------------------------------------------------------

  let userStatuses = {};
  let state = initialState;

  // Utils
  //--------------------------------------------------------------------------

  const handshakeUsers = () => {
    Object.entries(userStatuses).forEach(([k, v]) => {
      if (v) return;
      nextSend(k, {
        type: 'sharedSimpleState:handshake',
        payload: {},
      });
    });
  };

  const updateUsers = users => {
    const userIds = users.filter(u => u.type === 'browser').map(u => u.id);
    const nextUserStatuses = userIds.reduce(
      (acc, id) => ({ ...acc, [id]: userStatuses[id] }),
      {},
    );
    userStatuses = nextUserStatuses;
    handshakeUsers();
  };

  const sendStateToAll = ({ force = false } = {}) => {
    Object.entries(userStatuses).forEach(([k, v]) => {
      nextSend(k, {
        type: 'sharedSimpleState:state',
        payload: { state },
      });
    });
  };

  const nextSend = async (userId, message, options = {}) => {
    return send(userId, message, options);
  };

  const nextOnMessage = async (message, options = {}) => {
    const { type } = message;

    if (!type.startsWith('sharedSimpleState:'))
      return onMessage(message, options);

    const id = message.path[0];
    switch (type) {
      case 'sharedSimpleState:handshake': {
        return nextSend(id, {
          type: 'sharedSimpleState:state',
          payload: { state },
        });
      }

      case 'sharedSimpleState:state': {
        const nextState = message.payload.state;
        if (!nextState) return;
        userStatuses[id] = true;
        if (!isEqual(state, nextState)) {
          state = nextState;
          onChangeState(state);
        }
        return;
      }
    }
  };

  const sharedSimpleState = {
    saveUsers: updateUsers,

    changeState: async nextState => {
      state = nextState;

      sendStateToAll();
    },
  };

  updateUsers(initialUsers);
  setInterval(handshakeUsers, TIMEOUT);
  return {
    ...args,
    send: nextSend,
    onMessage: nextOnMessage,
    sharedSimpleState,
  };
};
