// Imports
// =============================================================================

import 'regenerator-runtime/runtime';
import uuid from './lib/uuid';

// Main
// =============================================================================

const MAX_SIZE = 10000;

const sentInChunksGenerators = {};

const sendAllInChunksGenerator = function*(id, type, fullPayload) {
  const chunksCount = Math.ceil(fullPayload.length / MAX_SIZE);
  for (let i = 0; i < chunksCount; i++) {
    const chunk = fullPayload.slice(i * MAX_SIZE, (i + 1) * MAX_SIZE);

    window.top.postMessage(
      {
        type: 'chunks',
        payload: JSON.stringify({
          id,
          type: `app:${type}`,
          chunk,
          chunkNo: i,
          chunksCount,
        }),
      },
      '*',
    );

    yield;
  }
};

const sendAllInChunks = (type, fullPayload) => {
  const id = uuid();
  sentInChunksGenerators[id] = sendAllInChunksGenerator(id, type, fullPayload);
  sentInChunksGenerators[id].next();
};

const main = () => {
  const eventTarget = new EventTarget();
  // TODO: make events cleanable

  const sendAll = (type, payload) => {
    const fullPayload = JSON.stringify(payload);
    if (fullPayload.length > MAX_SIZE) sendAllInChunks(type, fullPayload);
    else window.top.postMessage({ type, payload: fullPayload }, '*');
  };

  const on = (type, fn) =>
    eventTarget.addEventListener(type, e => fn(e.payload));

  let chunks = {};

  const receiveChunk = ({
    id,
    type,
    chunk,
    chunkNo,
    chunksCount,
    ...messageData
  }) => {
    if (!chunks[id]) {
      chunks[id] = '';
    }
    chunks[id] = chunks[id] + chunk;
    if (chunkNo !== chunksCount - 1) {
      sendAll('nextChunk', { id });
    } else {
      // FIXME: duplication with `if (type.startsWith('app:'))``
      const [prefix, ...typeSegments] = type.split(':');
      const passedType = typeSegments.join(':');
      const appEvent = new Event(passedType);
      appEvent.payload = JSON.parse(chunks[id]);
      eventTarget.dispatchEvent(appEvent);

      delete chunks[id];
    }
  };

  window.addEventListener('message', e => {
    if (!e.data) return; // TODO: why message with no data happens
    const { type, payload } = e.data;

    if (type === 'app:chunks') {
      receiveChunk(payload);
      return;
    }

    if (type === 'app:nextChunk') {
      const { id } = payload;
      const { done } = sentInChunksGenerators[id].next();
      if (done) delete sentInChunksGenerators[id];
      return;
    }

    if (type.startsWith('app:')) {
      const [prefix, ...typeSegments] = type.split(':');
      const passedType = typeSegments.join(':');
      const appEvent = new Event(passedType);
      appEvent.payload = payload;
      eventTarget.dispatchEvent(appEvent);
      return;
    }

    // TODO: rename transport:init to something like appStore:startApp
    if (type === 'transport:init') {
      //const evaluate = new Function('AppContext', payload.app.source);
      const AppContext = { sendAll, on, user: payload.user };
      //evaluate({ transport, user: payload.user });
      // dev
      window.AppContext = AppContext;
      //import('./apps/chat').then();
      import('./apps/WeGit').then();
    }
  });
};

main();
