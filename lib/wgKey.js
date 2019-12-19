// Imports
// =============================================================================

import VERSION from './version';

// Main
// =============================================================================

export const toWgKey = prefix => obj => {
  return `${prefix}(${VERSION},${btoa(JSON.stringify(obj))})`;
};

export const fromWgKey = wgKey => {
  const { prefix, version, key } = wgKey.match(
    /(?<prefix>.*)\((?<version>.*),(?<key>.*)\)/,
  ).groups;
  return JSON.parse(atob(key));
};
