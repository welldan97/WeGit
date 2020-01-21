// Imports
// =============================================================================

import uuid from './lib/uuid';
import addScript from 'wegit-lib/browser/utils/addScript';
// NOTE: necessary for async/await
import 'regenerator-runtime/runtime';

// Main
// =============================================================================

const main = async () => {
  await Promise.all([
    await addScript(
      'https://unpkg.com/react@16.12.0/umd/react.development.js',
      //'https://unpkg.com/react@16.12.0/umd/react.production.min.js',
    ),
    await addScript(
      'https://unpkg.com/react-dom@16.12.0/umd/react-dom.development.js',
      //'https://unpkg.com/react-dom@16.12.0/umd/react-dom.production.min.js',
    ),
  ]);

  const { default: App } = await import('./components/App');

  document.body.appendChild(document.createElement('div'));
  ReactDOM.render(<App />, document.getElementsByTagName('div')[0]);
};

main();
