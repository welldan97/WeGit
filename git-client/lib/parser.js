// Imports
// =============================================================================

const parseCapabilities = () => ({
  type: 'transport:capabilities',
});

const parseList = () => ({
  type: 'transport:list',
});

const parseFetch = value => {
  const refs = value
    .trim()
    .replace(/fetch /g, '')
    .split('\n')
    .map(line => {
      const [sha, ref] = line.split(' ');
      return { sha, ref };
    });

  return {
    type: 'transport:fetch',
    payload: { refs },
  };
};

// Main
// =============================================================================

module.exports = {
  stdinToMessage(value) {
    console.warn('[->]', value);
    switch (value) {
      case 'capabilities\n':
        return parseCapabilities(value);
      case 'list\n':
        return parseList(value);

      default: {
        if (value.startsWith('fetch')) return parseFetch(value);

        throw new Error(
          `Unknown git command\n ${JSON.stringify(value, undefined, 2)}`,
        );
      }
    }
  },

  messageToStdout(message) {
    const { type, payload } = message;
    console.warn('[<-]', type);
    switch (type) {
      case 'transport:capabilitiesResponse':
        return payload.capabilities.join('\n') + '\n\n';
      case 'transport:listResponse':
        return (
          payload.refs.map(({ sha, ref }) => `${sha} ${ref}`).join('\n') +
          '\n\n'
        );
      case 'transport:fetchResponse':
        return '\n';
      default:
        throw new Error(`Unknown message\n ${JSON.stringify(message)}`);
    }
  },
};
