// Imports
// =============================================================================

// Main
// =============================================================================

const main = () => {
  const eventTarget = new EventTarget();

  const send = (userId, message) => {
    window.top.postMessage({ method: 'send', args: [userId, message] }, '*');
  };

  const sendAll = message => {
    window.top.postMessage({ method: 'sendAll', args: [message] }, '*');
  };

  const on = (type, fn) => {
    if (type !== 'message') return;
    eventTarget.addEventListener('message', e => fn(e.data /* message */));
  };

  let AppShell;
  window.addEventListener('message', e => {
    if (!e.data) return;
    const { type, payload } = e.data;

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

    const appEvent = new Event('message');
    appEvent.data = e.data;
    eventTarget.dispatchEvent(appEvent);
  });

  window.top.postMessage({ method: 'init', args: [] }, '*');
};

main();
