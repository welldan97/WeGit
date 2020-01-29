// Imports
// =============================================================================

const VERSION = require('../version');

const { atob, btoa } = require('./atobtoa');

// Main
// =============================================================================

module.exports = {
  toWgKey: prefix => obj => {
    return `${prefix}("${VERSION}","${btoa(JSON.stringify(obj))}")`;
  },

  fromWgKey: wgKey => {
    const { prefix, version, key } = wgKey.match(
      /(?<prefix>.*)\("(?<version>.*)","(?<key>.*)"\)/,
    ).groups;

    return JSON.parse(atob(key));
  },
};
