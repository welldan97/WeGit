// Imports
// =============================================================================

import debounce from 'lodash/fp/debounce';

// Main
// =============================================================================

const TIMEOUT = 2000;

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

  let isReady = false;
  let status = 'current';
  let busy = false;

  let state = initialState;
  let latestState = initialState;

  let userStatuses = {};
  let updateQueue = [];

  let prevIsSynchronizing = false;
  let prevSyncTotal = 0;
  let prevSyncOutdated = 0;

  // Utils
  //--------------------------------------------------------------------------

  const updateInnerState = () => {
    const allStatuses = [status, ...Object.values(userStatuses)];
    const isSynchronizing = allStatuses.some(e => !e || e === 'outdated');
    const syncTotal = allStatuses.length;
    const syncOutdated = allStatuses.filter(e => !e || e === 'outdated').length;
    if (
      isSynchronizing !== prevIsSynchronizing ||
      syncTotal !== prevSyncTotal ||
      syncOutdated !== prevSyncOutdated
    )
      onSynchronizing(isSynchronizing, syncOutdated, syncTotal);
    prevIsSynchronizing = isSynchronizing;
    prevSyncOutdated = syncOutdated;
    prevSyncTotal = syncTotal;

    onInnerStateChange({
      isReady,
      status,
      busy,
      state,
      latestState,
      userStatuses,
      updateQueue,
    });
  };

  const handshakeUsers = () => {
    if (!isReady) return;
    Object.entries(userStatuses).forEach(([k, v]) => {
      if (v) return;
      console.log(userStatuses, k, v);
      nextSend(k, {
        type: 'sharedState:handshake',
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
    updateInnerState();
    handshakeUsers();
  };

  const maybeTriggerUpdate = () => {
    if (!isReady) return;
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
    if (!isReady) return;
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
    if (!isReady) return;
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
      console.log('!!', userStatuses);
      updateInnerState();
      sendStateToAll();
    },
    ready: () => {
      console.log({ isReady });
      if (isReady) return;
      isReady = true;
      updateInnerState();
      handshakeUsers();
    },
  };

  updateUsers(initialUsers);
  updateInnerState();
  setInterval(handshakeUsers, TIMEOUT);
  return { ...args, send: nextSend, onMessage: nextOnMessage, sharedState };
};

// TODO:
// handle when user comes and the rest are synchronizing
