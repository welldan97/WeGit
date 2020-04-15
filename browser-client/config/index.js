// Imports
// =============================================================================

import parseAppSource from 'wegit-lib/utils/parseAppSource';

import { readFileSync } from 'fs';
const WeWeWeChatSource = readFileSync(
  __dirname + '../../../apps/WeWeWeChat/index.jsx',
  'utf-8',
);

// Main
// =============================================================================

export default () => ({
  tab: 'network',
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  initialApps: [
    parseAppSource(WeWeWeChatSource),
    /*
    // WeBlank is useful for development
    {
      id: 'WE-WE-WE-WE-WE--BLANK',
      name: 'WeBlank',
      description: '',
      icon: '\u{1F932}',
      user: {
        userName: 'welldan97',
      },
      source: 'console.log("hello from WeBlank")',
    },
    */
  ],
  runApp: false,
  //runApp: 'WE-WE-WE-WE-WE--BLANK',
  iframeMode: {
    type: 'sameOrigin',
    //url: 'http://localhost:1235',
  },
  serviceWorkers: false,
  appShellLocalApp: false,
  alwaysDefaultConfig: false,
});
