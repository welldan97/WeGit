// Imports
// =============================================================================

import React, { memo, useEffect, useState, useRef } from 'react';

import Iframe from './Iframe';

// Events
// =============================================================================

const methods = ({ app, currentUser, users, transport }) => ({
  send: (userId, message) => {
    if (message.type.startsWith('os:')) return;

    transport.send(userId, {
      type: `app:${message.type}`,
      payload: message.payload,
    });
  },

  sendAll: message => {
    if (message.type.startsWith('os:')) return;

    transport.sendAll({
      type: `app:${message.type}`,
      payload: message.payload,
    });
  },

  init: () => {
    transport.sendBack({
      type: 'app:os:runAppShell',
      payload: {
        app,
        currentUser,
        users,
      },
    });
  },

  saveCurrentUser: currentUser => {
    transport.sendBack({
      type: 'app:os:saveCurrentUser',
      payload: {
        currentUser,
      },
    });
  },

  saveUsers: users => {
    transport.sendBack({
      type: 'app:os:saveUsers',
      payload: {
        users,
      },
    });
  },
});

// Main
// =============================================================================

export default memo(function AppShell({
  runningApp,
  currentUser,
  users,
  transport,
  utils,
}) {
  const [iFrameKey, setIFrameKey] = useState(0);
  const stateRef = useRef(undefined);

  const listenerRef = useRef(undefined);
  useEffect(() => {
    listenerRef.current = e => {
      if (!e.data || !e.data.method || !e.data.args) return;
      const { method, args } = e.data;
      methods({ app: runningApp, currentUser, users, transport })[method](
        ...args,
      );
    };
  }, [runningApp, currentUser, users, transport]);

  useEffect(() => {
    methods({ app: runningApp, currentUser, users, transport }).saveCurrentUser(
      currentUser,
    );
  }, [currentUser]);

  useEffect(() => {
    methods({ app: runningApp, currentUser, users, transport }).saveUsers(
      users,
    );
  }, [users]);

  useEffect(() => {
    window.addEventListener('message', listenerRef.current);

    return () => {
      window.removeEventListener('message', listenerRef.current);
    };
  });

  useEffect(() => {
    setIFrameKey(iFrameKey + 1);
    stateRef.current = runningApp;
  }, [runningApp]);

  console.log('AppShell rerender');

  if (!runningApp) return null;

  return (
    <Iframe
      runningApp={runningApp}
      currentUser={currentUser}
      users={users}
      transport={transport}
      utils={utils}
      key={iFrameKey}
    />
  );
});
