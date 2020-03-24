#!/usr/bin/env node

// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = ({ send, onMessage }) => {
  const nextSend = (userId, message) => {
    return send(userId, message);
  };

  const nextOnMessage = message => {
    const { type: rawType, payload } = message;
    if (!rawType.startsWith('transport:')) return onMessage(message);
    const type = rawType.replace(/^transport:/, '');

    switch (type) {
      case 'capabilitiesResponse':
      // TODO
      default:
        return onMessage(message);
    }
  };

  return { send: nextSend, onMessage: nextOnMessage };
};
