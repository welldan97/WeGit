// Imports
// =============================================================================

// Main
// =============================================================================

const addScript = async (src, ch) =>
  new Promise(resolve => {
    const $script = document.createElement('script');
    $script.setAttribute('src', src);
    document.body.appendChild($script);
    $script.addEventListener('load', () => resolve());
  });

addScript('https://unpkg.com/react@16.12.0/umd/react.production.min.js')
  .then(() =>
    addScript(
      'https://unpkg.com/react-dom@16.12.0/umd/react-dom.production.min.js',
    ),
  )
  .then(
    Promise.all([
      addScript('https://unpkg.com/browserfs'),
      addScript(
        'https://unpkg.com/isomorphic-git@0.72.0/dist/internal.umd.min.js',
      ),
    ]),
  )
  .then(resolve => setTimeout(resolve, 300)) // TODO
  .then(() => {
    window.gitInternals = window.git;
    delete window.git;
    return addScript('https://unpkg.com/isomorphic-git');
  })
  .then(resolve => setTimeout(resolve, 100)) //TODO
  .then(() => import('./components/App'))
  .then(({ default: App }) => {
    document.body.appendChild(document.createElement('main'));
    ReactDOM.render(<App />, document.getElementsByTagName('main')[0]);
  });
