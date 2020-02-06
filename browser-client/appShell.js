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

  window.addEventListener('message', e => {
    if (!e.data) return;
    const { type, payload } = e.data;

    if (type === 'init') {
      const evaluate = new Function('AppShell', payload.app.source);

      const AppShell = {
        send,
        sendAll,
        on,
        currentUser: payload.currentUser,
        users: payload.users,
      };

      evaluate(AppShell);
      return;
    }

    const appEvent = new Event('message');
    appEvent.data = e.data;
    eventTarget.dispatchEvent(appEvent);
  });

  window.top.postMessage({ method: 'init', args: [] }, '*');
};

main();
