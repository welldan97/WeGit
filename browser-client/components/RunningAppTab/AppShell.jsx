// Imports
// =============================================================================

import React, { memo, useEffect, useState, useRef } from 'react';
import isEqual from 'lodash/fp/isEqual';

import Iframe from './Iframe';

// Events
// =============================================================================

const methods = ({ app, currentUser, users, transport, utils, onReady }) => ({
  send(userId, message) {
    if (message.type.startsWith('os:')) return;

    transport.send(userId, {
      type: `app:${message.type}`,
      payload: message.payload,
    });
  },

  // TODO: this is probably not needed since sendAll now implemented in appShell
  //   to support sending in chunks
  /*
  sendAll: message => {
    if (message.type.startsWith('os:')) return;

    transport.sendAll({
      type: `app:${message.type}`,
      payload: message.payload,
    });
  },
  */

  init() {
    transport.sendBack({
      type: 'app:os:prepareAppShell',
      payload: {
        source: `(${utils.addStyles.toString()})("${JSON.stringify(
          utils.styles,
        ).slice(1, -1)}")`,
      },
    });
  },

  prepareAppShellSuccess() {
    transport.sendBack({
      type: 'app:os:runApp',
      payload: {
        app,
        currentUser,
        users,
      },
    });
  },

  ready() {
    onReady();
  },

  saveCurrentUser(currentUser) {
    transport.sendBack({
      type: 'app:os:saveCurrentUser',
      payload: {
        currentUser,
      },
    });
  },

  saveUsers(users, prevUsers) {
    if (isEqual(users, prevUsers)) return;
    console.log('SAVE', users, prevUsers);
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
  config,
}) {
  // Set up methods
  // ---------------------------------------------------------------------------

  const methodsRef = useRef(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    methodsRef.current = methods({
      app: runningApp,
      currentUser,
      users,
      transport,
      utils,
      onReady: () => setIsReady(true),
    });
  }, [runningApp, currentUser, users, transport]);

  // Reinitiate iframe when app changes by updating key
  // ---------------------------------------------------------------------------

  const [iframeKey, setIframeKey] = useState(0);
  const appRef = useRef(undefined);
  useEffect(() => {
    setIsReady(false);
    // FIXME: looks buggy here
    // Update key only when app was run straight after another app
    if (appRef.current && runningApp && appRef.current !== runningApp)
      setIframeKey(iframeKey + 1);

    appRef.current = runningApp;
  }, [runningApp]);

  // Set up messaging
  // ---------------------------------------------------------------------------

  const listenerRef = useRef(undefined);

  useEffect(() => {
    const listener = e => listenerRef.current(e);
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    if (!runningApp) return;

    listenerRef.current = e => {
      if (!e.data || !e.data.method || !e.data.args) return;
      const { method, args } = e.data;
      methodsRef.current[method](...args);
    };
  }, [runningApp, currentUser, users, transport]);

  // Send updates
  // ---------------------------------------------------------------------------

  useEffect(() => methodsRef.current.saveCurrentUser(currentUser), [
    currentUser,
  ]);

  const prevUsersRef = useRef(users);

  useEffect(() => {
    // FIXME: fixing some users events mistakes here
    //   this should be fixed somewhere earlier
    //   also this whole file seem ugly, should be refactored
    const nextUsers = users.filter(e => e);
    methodsRef.current.saveUsers(nextUsers, prevUsersRef.current);
    prevUsersRef.current = nextUsers;
  }, [users]);

  // Render
  // ---------------------------------------------------------------------------

  if (!runningApp) return null;
  return (
    <Iframe
      iframeMode={config.iframeMode}
      transport={transport}
      isReady={isReady}
      key={iframeKey}
      id={runningApp.id}
    />
  );
});
