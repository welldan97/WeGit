// Imports
// =============================================================================

const net = require('net');
const fetch = require('node-fetch');

const WgOs = require('wegit-lib/WgOs');
const { toWgKey, fromWgKey } = require('wegit-lib/utils/wgKey');

// Utils
// =============================================================================

const connectToWgOS = async wgOs => {
  const { wgOffer } = await wgOs.invite();
  const wgOfferKey = toWgKey('wgOffer')(wgOffer);
  const response = await fetch('http://localhost:1236', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wgOfferKey }),
  });
  const { wgAnswerKey } = await response.json();
  await wgOs.establish(fromWgKey(wgAnswerKey));
};

// Main
// =============================================================================

const defaultSettings = {
  config: {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  },
  currentUser: { userName: undefined },
  apps: [],
};

const main = async () => {
  const wgOs = new WgOs(defaultSettings);
  await connectToWgOS(wgOs);

  const server = net.createServer(async connection => {
    connection.on('data', data => {
      const { method, args } = JSON.parse(data);
      if (method !== 'send') throw new Error('Unsupported method');
      const [userId, message] = args;
      wgOs.send(userId, message);
    });

    const onMessage = e => {
      const { type, payload } = e.data;
      if (!type.startsWith('app:')) return;
      connection.write(JSON.stringify({ type, payload }));
    };

    wgOs.on('message', onMessage);
    wgOs.on('mesh:change', (...args) => console.log('mesh:change', args));

    wgOs.on('users:change', (...args) => console.log('users:change', args));

    wgOs.on('apps:change', (...args) => console.log('apps:change', args));

    connection.on('end', () => {
      // ??????
      // PROFIT!!!
    });
  });

  server.listen(9001, () => {
    console.log('server is listening on 9001');
  });
};

main();
