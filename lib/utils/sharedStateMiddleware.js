// Imports
// =============================================================================

import debounce from 'lodash/fp/debounce';

// Main
// =============================================================================

module.exports = ({
  onChangeState = () => {},
  onInnerStateChange = () => {},
  stateComparator = () => {},
  onSynchronizing = () => {},
  initialState,
  initialUsers,
} = {}) => ({ send, onMessage, ...args }) => {
  // State
  //--------------------------------------------------------------------------
  let status = 'current';
  let busy = false;

  let state = initialState;
  let latestState = initialState;

  let userStatuses = {};
  let updateQueue = [];

  let prevIsSynchronizing = false;

  // Utils
  //--------------------------------------------------------------------------

  const updateInnerState = () => {
    const isSynchronizing =
      status === 'outdated' ||
      Object.values(userStatuses).some(e => !e || e === 'outdated');
    if (isSynchronizing !== prevIsSynchronizing)
      onSynchronizing(isSynchronizing);
    prevIsSynchronizing = isSynchronizing;

    onInnerStateChange({
      status,
      busy,
      state,
      latestState,
      userStatuses,
      updateQueue,
    });
  };

  const handshakeUsers = () => {
    Object.entries(userStatuses).forEach(([k, v]) => {
      if (v) return;

      nextSend(k, {
        type: 'sharedState:handshake',
        payload: {},
      });
    });
  };

  const updateUsers = users => {
    console.log('upd');
    const userIds = users.map(u => u.id);
    userStatuses = userIds.reduce(
      (acc, id) => ({ ...acc, [id]: userStatuses[id] }),
      {},
    );

    updateInnerState();
    handshakeUsers();
  };

  const maybeTriggerUpdate = () => {
    if (busy) return;
    if (!updateQueue.length) return;

    const id = updateQueue.shift();
    busy = true;
    updateInnerState();

    nextSend(id, {
      type: 'sharedState:update',
      payload: {},
    });
  };

  const scheduleUpdate = id => {
    if (updateQueue.includes(id)) return;
    updateQueue.push(id);
    maybeTriggerUpdate();
    updateInnerState();
  };

  const sendStateToAll = () => {
    // Send update to all
    Object.entries(userStatuses).forEach(([k, v]) => {
      nextSend(k, {
        type: 'sharedState:state',
        payload: { state, busy },
      });
    });
  };

  const nextSend = async (userId, message, options = {}) => {
    if (message.type.startsWith('sharedState:')) console.warn('->', message);
    return send(userId, message, options);
  };

  const nextOnMessage = async (message, options = {}) => {
    const { type } = message;

    if (!type.startsWith('sharedState:')) return onMessage(message, options);
    console.warn('<-', message);

    const id = message.path[0];
    switch (type) {
      case 'sharedState:handshake': {
        return nextSend(id, {
          type: 'sharedState:state',
          payload: { state, busy },
        });
      }

      case 'sharedState:state': {
        const nextState = message.payload.state;
        const stateDiff = await stateComparator(latestState, nextState);

        if (stateDiff > 0) {
          // they have outdated state - do nothing

          userStatuses[id] = 'outdated';
          updateInnerState();
        } else if (stateDiff === 0) {
          // same state - do nothing

          userStatuses[id] = 'current';
          if (status === 'outdated') scheduleUpdate(id);

          updateInnerState();
        } else {
          // we have outdated state - ask for updates
          // set all who had current state - outdated state
          Object.entries(userStatuses).forEach(([k, v]) => {
            if (v === 'current') userStatuses[k] = 'outdated';
          });
          userStatuses[id] = 'current';
          latestState = nextState;
          status = 'outdated';
          scheduleUpdate(id);

          updateInnerState();
        }

        return;
      }

      case 'sharedState:update': {
        if (!busy) {
          busy = true;
          updateInnerState();

          nextSend(id, {
            type: 'sharedState:updateOk',
            payload: {},
          });
        } else {
          nextSend(id, {
            type: 'sharedState:updateNo',
            payload: {},
          });
        }
        return;
      }

      case 'sharedState:updateOk': {
        await onChangeState(latestState, id);
        state = latestState;
        busy = false;
        status = 'current';
        updateQueue = [];

        updateInnerState();

        nextSend(id, {
          type: 'sharedState:updateDone',
          payload: {},
        });

        sendStateToAll();

        return;
      }

      case 'sharedState:updateNo': {
        busy = false;
        updateInnerState();

        maybeTriggerUpdate();
        return;
      }

      case 'sharedState:updateDone': {
        busy = false;
        userStatuses[id] = 'current';
        updateInnerState();
        sendStateToAll();
        return;
      }
    }
  };

  const sharedState = {
    saveUsers: updateUsers,

    changeState: async nextState => {
      state = nextState;
      latestState = state;
      Object.entries(userStatuses).forEach(([k, v]) => {
        if (v === 'current') userStatuses[k] = 'outdated';
      });
      sendStateToAll();
    },
  };

  updateUsers(initialUsers);
  updateInnerState();
  return { ...args, send: nextSend, onMessage: nextOnMessage, sharedState };
};

// TODO:
// handle when user comes and the rest are synchronizing
