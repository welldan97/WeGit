// Imports
// =============================================================================

const VERSION = require('./version');

// Main
// =============================================================================

const realBtoa =
  typeof btoa !== 'undefined'
    ? btoa
    : string => Buffer.from(string).toString('base64');
const realAtob =
  typeof atob !== 'undefined'
    ? atob
    : string => Buffer.from(string, 'base64').toString();

module.exports = {
  toWgKey: prefix => obj => {
    return `${prefix}(${VERSION},${realBtoa(JSON.stringify(obj))})`;
  },

  fromWgKey: wgKey => {
    const { prefix, version, key } = wgKey.match(
      /(?<prefix>.*)\((?<version>.*),(?<key>.*)\)/,
    ).groups;
    return JSON.parse(realAtob(key));
  },
};
