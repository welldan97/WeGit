// Imports
// =============================================================================

//import App from './components/App';

// Main
// =============================================================================

const addScript = async (src, ch) =>
  new Promise(resolve => {
    const $script = document.createElement('script');
    $script.setAttribute('src', src);
    document.body.appendChild($script);
    $script.addEventListener('load', () => resolve());
  });

addScript('https://unpkg.com/react@16/umd/react.development.js')
  .then(() =>
    addScript('https://unpkg.com/react-dom@16/umd/react-dom.development.js'),
  )
  .then(
    Promise.all([
      addScript('https://unpkg.com/browserfs'),
      addScript('https://unpkg.com/isomorphic-git'),
    ]),
  )
  .then(() => import('./components/App'))
  .then(({ default: App }) => {
    document.body.appendChild(document.createElement('main'));
    ReactDOM.render(<App />, document.getElementsByTagName('main')[0]);
  });
