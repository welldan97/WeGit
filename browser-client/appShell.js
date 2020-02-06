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

  const on = (type, fn) =>
    eventTarget.addEventListener(type, e => fn(e.data.payload));

  window.addEventListener('message', e => {
    if (!e.data) return;
    const { type, payload } = e.data;

    if (type === 'init') {
      const evaluate = new Function('AppContext', payload.app.source);

      const AppContext = {
        send,
        sendAll,
        on,
        currentUser: payload.currentUser,
        users: payload.users,
      };

      evaluate(AppContext);
      return;
    }

    const appEvent = new Event(type);
    appEvent.data = { payload };
    eventTarget.dispatchEvent(appEvent);
  });

  window.top.postMessage({ method: 'init', args: [] }, '*');
};

main();
