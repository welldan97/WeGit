// Imports
// =============================================================================

// Main
// =============================================================================

export default () => ({
  tab: 'network',
  defaultSettings: {
    config: {
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    },
    currentUser: { userName: undefined, type: 'browser' },
    apps: [
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
  },
  iframeMode: {
    type: 'sameOrigin',
    url: 'http://localhost:1235',
  },
  dev: {
    appShellLocalApp: false,
    runApp: false,
    //runApp: 'WE-WE-WE-WE-WE--BLANK',
  },
});
