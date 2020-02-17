// NOTE: universal atob/btoa helpers

// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = {
  btoa:
    typeof btoa !== 'undefined'
      ? btoa
      : string => Buffer.from(string).toString('base64'),

  atob:
    typeof atob !== 'undefined'
      ? atob
      : string => Buffer.from(string, 'base64').toString(),
};
