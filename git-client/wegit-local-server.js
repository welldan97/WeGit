// Imports
// =============================================================================

const net = require('net');

// Imports
// =============================================================================
const wrtc = require('wrtc');
const EventTarget = require('@ungap/event-target');
const Event = require('./lib/event-shim');
const uuid = require('uuid/v4');

const WgAppStore = require('wegit-lib/WgAppStore');

const inquirer = require('inquirer');
const clipboardy = require('clipboardy');

// Main
// =============================================================================

const main = async () => {
  const userName = Math.random()
    .toString(36)
    .substring(7);
  const user = { userName };
  const wgAppStore = new (WgAppStore({ Event, EventTarget, uuid, wrtc }))({
    user,
  });
  const { wgOfferKey } = await wgAppStore.create();

  clipboardy.writeSync(wgOfferKey);

  console.log(
    'Your connection offer has been created and it has been copied to your clipboard.',
  );
  console.log(
    'Send it to WeGit network user so they can join your connection.',
  );

  console.log('');
  console.log('Your offer:');
  console.log('');

  console.log(wgOfferKey);

  console.log('');
  console.log(
    'Once your connection will be joined. You should be sent the answer from the user. Paste it here',
  );
  console.log('');

  const questions = [
    {
      type: 'input',
      name: 'wgAnswerKey',
      message: 'Your connection answer',
    },
  ];

  const { wgAnswerKey } = await inquirer.prompt(questions);

  wgAppStore.establish(wgAnswerKey);

  const server = net.createServer(async connection => {
    connection.on('data', message => {
      const parsedMessage = JSON.parse(message.toString());
      //const { type, payload } = parsedMessage;
      wgAppStore.sendAll(parsedMessage);
    });

    const onMessage = e => {
      const { type, payload } = e.data;
      if (!type.startsWith('app:')) return;
      connection.write(JSON.stringify({ type, payload }));
    };

    wgAppStore.addEventListener('message', onMessage);

    connection.on('end', () => {
      wgAppStore.removeEventListener('message', onMessage);
      //
    });
  });

  server.listen(9001, () => {
    console.log('server is listening on 9001');
  });
};
main();
