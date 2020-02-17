// Imports
// =============================================================================

import sendInChunksMiddleware from 'wegit-lib/utils/sendInChunksMiddleware';

// Main
// =============================================================================

const main = () => {
  let AppShell;
  const eventTarget = new EventTarget();

  const { send, onMessage } = sendInChunksMiddleware({
    send(userId, message) {
      window.top.postMessage({ method: 'send', args: [userId, message] }, '*');
    },

    onMessage(message) {
      const appEvent = new Event('message');
      appEvent.data = message;
      eventTarget.dispatchEvent(appEvent);
    },
  });

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
      case 'os:runAppShell': {
        const evaluate = new Function('AppShell', payload.app.source);

        AppShell = {
          send,
          sendAll,
          on,
          currentUser: payload.currentUser,
          users: payload.users,
        };

        evaluate(AppShell);
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

  window.top.postMessage({ method: 'init', args: [] }, '*');
};

main();
