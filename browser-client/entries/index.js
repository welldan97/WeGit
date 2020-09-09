// Imports
// =============================================================================

import React from 'react';
import ReactDOM from 'react-dom';
// NOTE: necessary for async/await
import 'regenerator-runtime/runtime';

import addStyles from 'wegit-lib/browser/utils/addStyles';
import styles from 'wegit-lib/browser/bootstrap.min.css';

import App from '../components/App';

// NOTE: using source to avoid extra code with iframe
// may be parcel handles it though
import appShellSource from './appShellSource';

// Utils
// =============================================================================

const isIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Main
// =============================================================================

const main = async () => {
  const source = document.body.innerHTML.trim() + '\n';
  document.documentElement.innerHTML =
    '<head><link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"></head><body><div></div></body>';
  addStyles(styles);

  ReactDOM.render(
    <App utils={{ addStyles, styles }} source={source} />,
    document.getElementsByTagName('div')[0],
  );
};

const appShell = () => {
  document.documentElement.innerHTML = '<head></head><body><div></div></body>';

  const evaluate = new Function(appShellSource);
  evaluate();
};

if (isIframe()) appShell();
else main();
