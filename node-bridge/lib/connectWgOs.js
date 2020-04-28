// Imports
// =============================================================================

const WgOs = require('wegit-lib/WgOs');
const httpsSignallingClient = require('wegit-signalling-https');
const firebaseSignallingClient = require('wegit-signalling-firebase');

// Utils
// =============================================================================

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

module.exports = ({ config, userName }) => {
  const currentUser = {
    userName,
    type: 'server',
  };

  const signalling = {
    https: httpsSignallingClient,
    firebase: firebaseSignallingClient,
  };

  let meshState = {
    connections: [],
    globalState: 'disconnected',
  };

  const wgOs = new WgOs({
    config: {
      iceServers: config.iceServers,
    },
    signalling:
      config.signalling &&
      signalling[config.signalling.type](config.signalling.options),
    currentUser,
  });

  let onChangeFn = () => {};
  const onChange = ({ wgOs }) => {
    meshState = getMeshState(wgOs);
    onChangeFn({ meshState });
  };

  let onMessageFn = () => {};
  const onMessage = message => {
    const { type } = message;

    if (!type.startsWith('app:')) return;
    onMessageFn({
      ...message,
      type: type.replace(/^app:/, ''),
    });
  };

  wgOs.on('mesh:change', onChange);
  wgOs.on('users:change', onChange);
  wgOs.on('apps:change', onChange);
  wgOs.on('message', onMessage);

  return {
    wgOs,
    send: (userId, message) => wgOs.send(userId, message),

    onChange: fn => (onChangeFn = fn),
    onMessage: fn => (onMessageFn = fn),
  };
};
