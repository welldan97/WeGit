#!/usr/bin/env node

// Imports
// =============================================================================

const cp = require('child_process');
const fs = require('fs');
const net = require('net');

const git = require('isomorphic-git');
const gitInternals = require('isomorphic-git/dist/for-node/isomorphic-git/internal-apis');
const ora = require('ora');

const receiveInChunksMiddleware = require('wegit-lib/utils/receiveInChunksMiddleware');
const sendInChunksMiddleware = require('wegit-lib/utils/sendInChunksMiddleware');

const parser = require('./lib/parser');
const transportMiddleware = require('./lib/transportMiddleware');
const findAgentMiddleware = require('./lib/findAgentMiddleware');

// Utils
// =============================================================================

const onError = message => {
  console.warn('');
  console.warn(`Error: ${message}`);
  process.exit(1);
};

const getRootDir = async () =>
  new Promise(resolve => {
    const gitProcess = cp.spawn('git', ['rev-parse', '--git-dir']);
    gitProcess.stdout.on('readable', () => {
      const rawValue = gitProcess.stdout.read();
      if (!rawValue) return;
      const value = rawValue.toString().trim();
      if (value === '.git') return void resolve('.');
      resolve(value.replace(/\/\.git$/, ''));
    });
  });

// Main
// =============================================================================

const DEBUG = false;
const DEBUG2 = false;

const port = process.env.PORT || 1996;

git.plugins.set('fs', fs);

const main = async () => {
  let meshState = {
    connections: [],
    globalState: 'disconnected',
  };

  // send abort if no push needed
  let shouldSendAbort = false;

  let isReady = false;
  let isReadyResolve;
  const isReadyPromise = new Promise(
    resolve => (isReadyResolve = (...args) => resolve(...args)),
  );

  const onChange = async nextMeshState => {
    if (!isReady && nextMeshState.globalState === 'connected') {
      isReady = true;
      isReadyResolve(nextMeshState);
    }
    meshState = nextMeshState;
  };

  const dir = await getRootDir();

  const connection = net.connect({ port }, async () => {
    const remote = process.argv[2];
    const url = process.argv[3];

    const spinner = ora('Connecting…').start();
    const onProgress = progress => {
      const phase =
        progress.phasesTotal > 1
          ? `(${progress.phaseNo}/${progress.phasesTotal}) `
          : '';

      const loaded = progress.lengthComputable
        ? ` ${Math.floor((progress.loaded / progress.total) * 100)}%`
        : '';

      spinner.text = `${phase}${progress.phase}…${loaded}\n`;
    };

    const onDone = () => {
      spinner.stop();
      console.warn('\u{2705} Done');
    };

    const { send, onMessage, findAgent } = receiveInChunksMiddleware(
      transportMiddleware({
        git,
        gitInternals,
        fs,
        dir,
        remote,
        url,
        onError,
        onProgress,
        DEBUG,
      })(
        findAgentMiddleware({ isReadyPromise })(
          sendInChunksMiddleware({
            send(userId, message) {
              if (!userId) return;
              const { type, payload } = message;
              if (DEBUG2)
                console.warn('->', JSON.stringify(message, undefined, 2));

              connection.write(
                JSON.stringify({
                  method: 'send',
                  args: [userId, { type: `app:${type}`, payload }],
                }),
              );
            },

            onMessage(message) {
              const value = parser.messageToStdout(message);
              if (DEBUG) console.warn('[<-]', value);
              // TODO: move from here
              if (message.type === 'transport:fetchResponse') onDone();
              if (message.type === 'transport:pushResponse') onDone();
              if (
                message.type === 'transport:listResponse' &&
                !message.payload.refs.length &&
                !message.payload.forPush
              )
                onDone();

              process.stdout.write(value);
            },
          }),
        ),
      ),
    );

    connection.on('data', data => {
      const { method, args } = JSON.parse(data.toString());
      switch (method) {
        case 'change':
          return onChange(...args);
        case 'send': {
          if (DEBUG2) console.warn('<-', JSON.stringify(args[0], undefined, 2));
          return onMessage(...args, {
            onProgress: progress => {
              onProgress({
                ...progress,
                phaseNo: 2,
                phasesTotal: 2,
              });
            },
          });
        }
        default:
          return onError(`unknown method ${method}`);
      }
    });

    await isReadyPromise;
    const agent = await findAgent;
    if (!agent) return void onError('Could not connect, try again later');

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      (async () => {
        const value = process.stdin.read();

        if (value === null || value === '\n') {
          process.exit();
          return;
        }

        if (DEBUG) console.warn('[->]', value);
        const message = parser.stdinToMessage(value);

        shouldSendAbort = false;
        if (message.type === 'transport:list') shouldSendAbort = true;

        await send(agent, message, {
          onProgress: progress => {
            if (!progress) return;
            onProgress({
              ...progress,
              phaseNo: 2,
              phasesTotal: 3,
            });
          },
        });
        if (message.type === 'transport:push')
          onProgress({
            phase: 'Updating',
            loaded: 0,
            lengthComputable: false,
            phaseNo: 3,
            phasesTotal: 3,
          });
      })();
    });

    process.on('exit', () => {
      if (shouldSendAbort) {
        onDone();
        send(agent, { type: 'transport:abort', payload: undefined });
      }
    });
  });

  connection.on('end', () => onError('disconnected from server'));
};

main();
