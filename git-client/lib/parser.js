// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = {
  stdinToMessage(value) {
    switch (value) {
      case 'capabilities\n':
        return {
          type: 'transport:capabilities',
        };
      case 'list\n':
        return {
          type: 'transport:list',
        };

      default:
        throw new Error(
          `Unknown git command\n ${JSON.stringify(value, undefined, 2)}`,
        );
    }
  },

  messageToStdout(message) {
    const { type, payload } = message;
    switch (type) {
      case 'transport:capabilitiesResponse':
        return payload.capabilities.join('\n') + '\n\n';
      case 'transport:listResponse':
        return (
          payload.refs.map(({ sha, ref }) => `${sha} ${ref}`).join('\n') +
          '\n\n'
        );
      default:
        throw new Error(`Unknown message\n ${JSON.stringify(message)}`);
    }
  },
};
