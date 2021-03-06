// Imports
// =============================================================================

const parseCapabilities = () => ({
  type: 'transport:capabilities',
});

const parseList = value => ({
  type: 'transport:list',
  payload: {
    forPush: value === 'list for-push\n',
  },
});

const parseFetch = value => {
  const refHolders = value
    .trim()
    .replace(/fetch /g, '')
    .split('\n')
    .map(line => {
      const [oid, ref] = line.split(' ');
      return { oid, ref };
    });

  return {
    type: 'transport:fetch',
    payload: { refHolders },
  };
};

const parsePush = value => {
  const [fromRef, toRef] = value
    .split('\n')[0]
    .split(' ')[1]
    .split(':');

  return {
    type: 'transport:push',
    payload: { fromRef, toRef },
  };
};

// Main
// =============================================================================

module.exports = {
  stdinToMessage(value) {
    switch (value) {
      case 'capabilities\n':
        return parseCapabilities(value);
      case 'list\n':
        return parseList(value);
      case 'list for-push\n':
        return parseList(value);
      default: {
        if (value.startsWith('fetch')) return parseFetch(value);
        if (value.startsWith('push')) return parsePush(value);

        throw new Error(
          `Unknown git command\n ${JSON.stringify(value, undefined, 2)}`,
        );
      }
    }
  },

  messageToStdout(message) {
    const { type, payload } = message;
    switch (type) {
      case 'transport:capabilitiesResponse':
        return payload.capabilities.join('\n') + '\n\n';
      case 'transport:listResponse':
        return payload.refs.length
          ? payload.refs.map(({ oid, ref }) => `${oid} ${ref}`).join('\n') +
              '\n\n'
          : '\n';

      case 'transport:pushResponse':
        return `ok ${payload.refDiff[0].ref}\n\n`;
      case 'transport:fetchResponse':
        return '\n';

      default:
        throw new Error(`Unknown message\n ${JSON.stringify(message)}`);
    }
  },
};
