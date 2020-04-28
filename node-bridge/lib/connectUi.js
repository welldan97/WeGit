// Imports
// =============================================================================

const chalk = require('chalk');
const clipboardy = require('clipboardy');
const inquirer = require('inquirer');
const ora = require('ora');

const { toWgKey, fromWgKey } = require('wegit-lib/utils/wgKey');

const { stdin } = process;

// Utils
// =============================================================================

const clearScreen = async () => {
  console.log('\x1Bc');
  //return new Promise(resolve => setTimeout(resolve), 0);
};

const getUserType = user => {
  switch (user.type) {
    case 'browser':
      return '\u{1F30D}';
    case 'server':
      return '\u{1F4BB}';
    case 'signalling':
      return '\u{1F4E1}';
    default:
      return '\u{1F464}';
  }
};

// Main
// =============================================================================

class Ui {
  isReady = false;
  port = undefined;
  wgOs = undefined; // Should not be here, too much power
  userName = undefined;
  mode = 'loading';
  clientState = 'disconnected';
  spinner = undefined;

  constructor({ userName }) {
    this.userName = userName;

    this.loadingMode();
  }

  _onKey = key => {
    // Ctrl-C
    if (key === '\u0003') process.exit();
    if (!this.isReady) return;
    if (this.mode !== 'status') return;
    if (key === 'q') process.exit();
    if (key === '\r') this.inviteMode();
  };

  loadingMode() {
    this.mode = 'loading';
    this.spinner = ora('Starting server…').start();
  }

  statusMode() {
    this.mode = 'status';

    if (this.spinner) {
      this.spinner.stop();
      this.spinner = undefined;
    }

    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    stdin.on('data', this._onKey);

    this.renderStatus();
  }

  async inviteMode() {
    try {
      const { wgOs } = this;
      this.mode = 'invite';

      stdin.off('data', this._onKey);
      stdin.pause();

      await clearScreen();
      const spinner = ora('Creating offer, please wait…').start();

      const { wgOffer } = await wgOs.invite();
      const wgOfferKey = toWgKey('wgOffer')(wgOffer);
      clipboardy.writeSync(wgOfferKey);

      spinner.stop();

      await clearScreen();

      console.log('Your offer:');
      console.log('');
      console.log(wgOfferKey);
      console.log('');

      console.log(
        'Your connection offer has been created and it has been copied to your clipboard.',
      );
      console.log(
        'Send it to WeGit network user so they can join your connection.',
      );
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

      await wgOs.establish(fromWgKey(wgAnswerKey));
    } catch {
      await clearScreen();

      await inquirer.prompt([
        {
          type: 'list',
          name: 'nothing',
          message: 'Oops, something went wrong',
          choices: ['Okay'],
        },
      ]);
    }

    this.statusMode();
  }

  async renderStatus() {
    if (this.mode !== 'status') return;

    const { port } = this;
    let weGitNetworkState;
    if (!this.meshState || this.meshState.globalState === 'disconnected')
      weGitNetworkState = '\u{274C} ' + chalk.red('disconnected');
    else if (this.meshState.globalState === 'connected')
      weGitNetworkState = '\u{2705} ' + chalk.green('connected');
    else weGitNetworkState = '\u{23F3} ' + chalk.cyan('connecting');

    const clientState =
      this.clientState === 'connected'
        ? '\u{2705} ' + chalk.green('connected')
        : '\u{274C} ' + chalk.red('disconnected');

    const userName = this.userName || 'Unknown user';

    await clearScreen();

    console.log(`\u{1F310} WeGit node-bridge is listening on port ${port}\n`);
    console.log(`  WeGit Network: ${weGitNetworkState}`);
    console.log(`  Local Client:  ${clientState}`);
    console.log('');
    console.log('');
    console.log('\u{1F465} Peers:');
    console.log('');
    console.log(
      chalk.green(
        `  ${getUserType({
          type: 'server',
        })} ${userName} (${chalk.italic("That's you")})`,
      ),
    );
    if (this.meshState) {
      this.meshState.connections.forEach(c => {
        const userName = (c.user && c.user.userName) || 'Unknown user';
        const color = c.state === 'connected' ? 'green' : 'cyan';

        console.log(
          chalk[color](
            `  ${getUserType(c.user || {})} ${userName} (${chalk.italic(
              c.state,
            )})`,
          ),
        );
      });
    }
    console.log('');
    console.log('Press [Enter] to initiate manual connection');
    console.log('Press [q] to quit');
  }

  change({ meshState }) {
    this.meshState = meshState;
    this.renderStatus();
  }

  clientChange(state) {
    this.clientState = state;
    this.renderStatus();
  }

  ready({ port, wgOs }) {
    this.isReady = true;
    this.port = port;
    this.wgOs = wgOs;
    this.statusMode();
  }
}

module.exports = ({ userName }) => {
  const ui = new Ui({ userName });

  return {
    change: ({ meshState }) => ui.change({ meshState }),
    clientChange: state => ui.clientChange(state),
    ready: ({ port, wgOs }) => ui.ready({ port, wgOs }),
  };
};
