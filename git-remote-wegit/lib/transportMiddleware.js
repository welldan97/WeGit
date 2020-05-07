#!/usr/bin/env node

// Imports
// =============================================================================

const cp = require('child_process');
const path = require('path');
const gitHelpers = require('wegit-lib/utils/gitHelpers');

// Utils
// =============================================================================

// Handlers
// =============================================================================

let distRefObjects = undefined;
let srcRefObjects = undefined;

const fetchDiffBundle = {
  refDiff: undefined,
  objectBundle: undefined,
};

const getSendHandler = ({ fs, pfs, git, gitInternals, dir = '.', send }) => {
  const helpers = gitHelpers({
    fs,
    pfs,
    git,
    gitInternals,
    dir,
  });

  return {
    async fetch(userId, message) {
      const { payload } = message;
      const { refHolders } = payload;

      fetchDiffBundle.refDiff = await Promise.all(
        refHolders.map(async rh => {
          let hasOid;

          try {
            hasOid = await git.resolveRef({ dir, ref: rh.ref });
          } catch (e) {
            //
          }
          return {
            ref: rh.ref,
            wantOid: rh.oid,
            hasOid,
          };
        }),
      );

      const oidRanges = fetchDiffBundle.refDiff.map(r => ({
        wantOid: r.wantOid,
        hasOid: r.hasOid,
      }));

      send(userId, {
        type: message.type,
        payload: { oidRanges },
      });
    },

    async push(userId, message) {
      const { fromRef, toRef } = message.payload;
      const wantOid = srcRefObjects.find(o => o.ref === fromRef).oid;
      const hasOid = (distRefObjects.find(o => o.ref === toRef) || {}).oid;
      const objectBundle = await helpers.createObjectBundle([
        {
          hasOid,
          wantOid,
        },
      ]);
      send(userId, {
        type: message.type,
        payload: {
          diffBundle: {
            refDiff: [{ ref: toRef, hasOid, wantOid }],
            objectBundle,
          },
        },
      });
    },
  };
};

const getOnMessageHandler = ({
  fs,
  pfs,
  git,
  gitInternals,
  dir = '.',
  onMessage,
  remote,
  url,
}) => {
  const helpers = gitHelpers({
    fs,
    pfs,
    git,
    gitInternals,
    dir,
  });

  return {
    async onFetch(message) {
      const dirName = url.replace(/^.*\//, '');
      let nextDir = dir;
      fetchDiffBundle.objectBundle = message.payload.objectBundle;

      const exists = fs.existsSync(path.join(dir, '.git'));
      if (!exists) nextDir = path.join(dir, dirName);
      await gitHelpers({
        fs,
        pfs,
        git,
        gitInternals,
        dir: nextDir,
      }).applyObjectBundle(fetchDiffBundle.objectBundle);

      return onMessage(message);
    },

    onList(message) {
      const { payload } = message;
      if (!message.payload.forPush) return onMessage(message);

      const gitProcess = cp.spawn('git', ['show-ref', '--head']);

      gitProcess.stdout.on('readable', () => {
        const value = gitProcess.stdout.read();
        if (!value) return;

        distRefObjects = payload.refs;
        srcRefObjects = value
          .toString()
          .trim()
          .split('\n')
          .map(l => {
            const [oid, ref] = l.split(' ');
            return { oid, ref };
          });

        return onMessage(message);
      });
    },

    onBusy() {
      console.warn('The client is busy');
      process.exit(1);
    },
  };
};

// Main
// =============================================================================

module.exports = ({ fs, pfs, git, gitInternals, remote, url }) => ({
  send,
  onMessage,
}) => {
  const nextSend = async (userId, message) => {
    console.warn('->', message);

    const handler = getSendHandler({
      fs,
      pfs,
      git,
      gitInternals,
      send,
      remote,
      url,
    });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:')) return send(userId, message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetch': {
        await handler.fetch(userId, message);
        return;
      }

      case 'push': {
        await handler.push(userId, message);
        return;
      }
      default:
        return send(userId, message);
    }
  };

  const nextOnMessage = async message => {
    console.warn('<-', message);

    const handler = getOnMessageHandler({
      fs,
      pfs,
      git,
      gitInternals,
      onMessage,
      remote,
      url,
    });
    const { type: rawType } = message;

    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'fetchResponse':
        return void (await handler.onFetch(message));
      case 'listResponse':
        return void (await handler.onList(message));
      case 'busy':
        return void (await handler.onBusy());
      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
