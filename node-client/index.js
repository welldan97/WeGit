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

const getMeshState = wgOs => {
  const baseMeshState = wgOs.getMeshState();
  return {
    connections: baseMeshState.connections.map(c => ({
      ...c,
      user: wgOs.users.find(u => u.id === c.peer),
    })),
    globalState: baseMeshState.globalState,
  };
};

// Main
// =============================================================================

const defaultSettings = {
  config: {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  },
  currentUser: {
    userName: undefined,
    type: 'server',
  },
  apps: [],
};

let meshState = {
  connections: [],
  globalState: 'disconnected',
};
let connection = undefined;

const main = async () => {
  const wgOs = new WgOs(defaultSettings);
  await connectToWgOS(wgOs);

  const onChange = ({ wgOs }) => {
    meshState = getMeshState(wgOs);
  };

  const onMessage = message => {
    const { type } = message;
    if (!type.startsWith('app:')) return;
    if (!connection) return;
    connection.write(
      JSON.stringify({
        method: 'onMessage',
        args: [{ ...message, type: type.replace(/^app:/, '') }],
      }),
    );
  };

  const onData = data => {
    const { method, args } = JSON.parse(data);
    if (method !== 'send') throw new Error('Unsupported method');
    const [userId, message] = args;
    wgOs.send(userId, message);
  };

  wgOs.on('mesh:change', onChange);
  wgOs.on('users:change', onChange);
  wgOs.on('apps:change', onChange);

  wgOs.on('message', onMessage);

  const server = net.createServer(async nextConnection => {
    connection = nextConnection;
    connection.write(
      JSON.stringify({
        method: 'change',
        args: [meshState],
      }),
    );
    connection.on('data', onData);
    connection.on('end', () => connection.removeListener('data', onData));
  });

  server.listen(9001, () => {
    console.log('server is listening on 9001');
  });
};

main();
