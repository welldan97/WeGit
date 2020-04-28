// Imports
// =============================================================================

const net = require('net');
const EventEmitter = require('events');

// Utils
// =============================================================================

// Main
// =============================================================================

module.exports = ({ port }) => {
  let connection = undefined;

  let onMessageFn = () => {};

  let meshState = undefined;
  const change = ({ meshState: nextMeshState }) => {
    meshState = nextMeshState;
    if (!connection) return;
    connection.write(
      JSON.stringify({
        method: 'change',
        args: [meshState],
      }),
    );
  };

  const send = message => {
    if (!connection) return;
    connection.write(
      JSON.stringify({
        method: 'send',
        args: [message],
      }),
    );
  };

  const onData = data => {
    const { method, args } = JSON.parse(data);
    if (method !== 'send') throw new Error('Unsupported method');
    const [userId, message] = args;

    onMessageFn(userId, message);
  };

  let onChangeFn = () => {};
  const server = net.createServer(async nextConnection => {
    onChangeFn('connected');
    connection = nextConnection;
    connection.write(
      JSON.stringify({
        method: 'change',
        args: [meshState],
      }),
    );
    connection.on('data', onData);
    connection.on('end', () => {
      connection.removeListener('data', onData);
      connection = undefined;
      onChangeFn('disconnected');
    });
  });

  let onConnectFn = () => {};
  server.listen(port, () => {
    onConnectFn({ port });
  });

  return {
    change,
    send,

    onChange: fn => (onChangeFn = fn),
    onMessage: fn => (onMessageFn = fn),
    onConnect: fn => (onConnectFn = fn),
  };
};
