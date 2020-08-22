// Imports
// =============================================================================

import parseAppSource from 'wegit-lib/utils/parseAppSource';

import { readFileSync } from 'fs';
const WeWeWeChatSource = readFileSync(
  __dirname + '../../../apps/WeWeWeChat/index.jsx',
  'utf-8',
);

const baseConfig = JSON.parse(
  readFileSync(__dirname + '../../../config.json', 'utf-8'),
);

// Utils
// =============================================================================

const isFile = () => window.location.protocol === 'file:';

// Main
// =============================================================================
export default () => ({
  tab: 'network',
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  signalling: undefined,
  //runApp: 'WE-WE-WE-WE-WE-WECHAT',
  runApp: false,
  iframeMode: {
    // NOTE: crossOrigin doesn't work yet
    type: 'sameOrigin',
  },
  serviceWorkers: !isFile(),
  appShellLocalApp: false,
  alwaysDefaultConfig: false,
  ...baseConfig,
  initialApps: [
    parseAppSource(WeWeWeChatSource),
    ...(baseConfig.initialApps ?? []),
  ],
});
