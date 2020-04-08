// Imports
// =============================================================================

import receiveInChunksMiddleware from 'wegit-lib/utils/receiveInChunksMiddleware';
import sendInChunksMiddleware from 'wegit-lib/utils/sendInChunksMiddleware';

import config from '../config';

// Utils
// =============================================================================

const callMethod = (method, [...args] = []) => {
  window.top.postMessage({ method, args }, '*');
};

// Main
// =============================================================================

// Initialization goes like this:
// 1. This code runs
// 2. appShell sends to parent "init"
// 3. parent responds with "prepareAppShell" where runs arbitary code needed
//   for app
// 4. appShell responds with "prepareAppShellSuccess"
// 5. parent sends "runApp"
// 6. appShell responds with "ready"

const main = () => {
  let AppShell;
  const eventTarget = new EventTarget();

  const { send, onMessage } = receiveInChunksMiddleware(
    sendInChunksMiddleware({
      send(userId, message) {
        callMethod('send', [userId, message]);
      },

      onMessage(message) {
        const appEvent = new Event('message');
        appEvent.data = message;
        eventTarget.dispatchEvent(appEvent);
      },
    }),
  );

  const sendAll = message => {
    AppShell.users.forEach(u => send(u.id, message));
  };

  const on = (type, fn) => {
    if (type !== 'message') return;
    eventTarget.addEventListener('message', e => fn(e.data /* message */));
  };

  window.addEventListener('message', e => {
    const message = e.data;
    if (!message) return;
    const { type, payload } = message;
    switch (type) {
      case 'os:prepareAppShell': {
        const evaluate = new Function('AppShell', payload.source);
        evaluate(AppShell); // NOTE: AppShell could be undefined

        callMethod('prepareAppShellSuccess');
        return;
      }

      case 'os:runApp': {
        const evaluate = new Function('AppShell', payload.app.source);

        AppShell = {
          send,
          sendAll,
          on,
          currentUser: payload.currentUser,
          users: payload.users,
        };

        window.AppShell = AppShell;
        if (config().dev.appShellLocalApp) import('../dev').then(App => App());
        else evaluate(AppShell);

        callMethod('ready');
        return;
      }

      case 'os:saveCurrentUser': {
        AppShell.currentUser = payload.currentUser;
        return;
      }

      case 'os:saveUsers': {
        AppShell.users = payload.users;
        return;
      }
      default:
    }

    onMessage(message);
  });

  callMethod('init');
};

main();
