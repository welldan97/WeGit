import 'regenerator-runtime/runtime';

const main = () => {
  const eventTarget = new EventTarget();
  // TODO: make events cleanable
  const sendAll = (type, payload) =>
    window.top.postMessage({ type, payload }, '*');
  const on = (type, fn) =>
    eventTarget.addEventListener(type, e => fn(e.payload));

  window.addEventListener('message', e => {
    if (!e.data) return; // TODO: why message with no data happens
    const { type, payload } = e.data;
    if (type.startsWith('app:')) {
      const [prefix, ...typeSegments] = type.split(':');
      const passedType = typeSegments.join(':');
      const appEvent = new Event(passedType);
      appEvent.payload = payload;
      eventTarget.dispatchEvent(appEvent);
      return;
    }

    if (type === 'transport:init') {
      //const evaluate = new Function('AppContext', payload.app.source);
      const AppContext = { sendAll, on, user: payload.user };
      //evaluate({ transport, user: payload.user });
      // dev
      window.AppContext = AppContext;
      import('./apps/WeGit').then();
    }
  });
};

main();
