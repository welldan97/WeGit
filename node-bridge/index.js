// Imports
// =============================================================================
const fs = require('fs');

const connectUi = require('./lib/connectUi');
const connectWgOs = require('./lib/connectWgOs');
const connectServer = require('./lib/connectServer');

const getConfig = require('./config/index.js');

// Main
// =============================================================================
const port = process.env.PORT || 1996;
const userName = process.env.USER || undefined;

const main = async () => {
  let config = getConfig();
  if (process.argv[2] === '--config') {
    const file = fs.readFileSync(process.argv[3]);
    config = JSON.parse(file.toString());
  }

  const ui = connectUi({ userName });
  const serverTransport = connectServer({ port });
  const wgOsTransport = connectWgOs({ config, userName });

  serverTransport.onMessage((userId, message) => {
    wgOsTransport.send(userId, message);
  });

  serverTransport.onChange(state => {
    ui.clientChange(state);
  });

  serverTransport.onConnect(({ port }) => {
    ui.ready({ port, wgOs: wgOsTransport.wgOs });
  });

  wgOsTransport.onMessage(message => {
    serverTransport.send(message);
  });

  wgOsTransport.onChange(({ meshState }) => {
    serverTransport.change({ meshState });
    ui.change({ meshState });
  });
};

main();
