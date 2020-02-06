// Imports
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { readFileSync } from 'fs';

// NOTE: parcel builder loads it and replace it with contents automatically
// https://github.com/parcel-bundler/parcel/issues/970#issuecomment-381403710
const appShellSource = readFileSync(
  __dirname + '../../../appshell.js',
  'utf-8',
);

// Utils
// =============================================================================

const mountAppShell = ({ transport, iframe, app, currentUser, users }) => {
  iframe.contentWindow.eval(appShellSource);

  const listener = e => {
    if (!e.data) return;
    const { method, args } = e.data;
    if (method === 'send') {
      if (args[1].type === 'init') return;
      transport.send(args[0], {
        type: `app:${args[1].type}`,
        payload: args[1].payload,
      });
    } else if (method === 'sendAll') {
      if (args[0].type === 'init') return;
      transport.sendAll({
        type: `app:${args[0].type}`,
        payload: args[0].payload,
      });
    } else if (method === 'init') {
      iframe.contentWindow.postMessage(
        {
          type: 'init',
          payload: {
            app,
            currentUser,
            users,
          },
        },
        '*',
      );
    }
  };

  transport.setOnMessage(message => {
    if (!message.type.startsWith('app:')) return;
    iframe.contentWindow.postMessage(
      {
        type: message.type.replace(/^app:/, ''),
        payload: message.payload,
      },
      '*',
    );
  });

  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
    transport.setOnMessage(() => {});
  };
};

// Main
// =============================================================================

export default function RunningApp({
  runningApp,
  currentUser,
  users,
  transport,
}) {
  const ref = useRef(undefined);

  useEffect(() => {
    if (!ref.current) return;
    if (!transport) return;
    if (!runningApp) return;
    if (!currentUser) return;
    if (!users) return;

    const unmountAppShell = mountAppShell({
      transport,
      iframe: ref.current,
      app: runningApp,
      currentUser,
      users,
    });

    return unmountAppShell;
  }, [runningApp, currentUser, users]);

  const src = ''; // window.location.href;
  const sandbox = undefined;

  return (
    <iframe
      src={src}
      style={{ width: '100%', height: '100%' /*border: 'none'*/ }}
      sandbox={sandbox}
      ref={ref}
    ></iframe>
  );
}
