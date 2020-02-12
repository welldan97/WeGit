// Imports
// =============================================================================

import React from 'react';
import ReactDOM from 'react-dom';
// NOTE: necessary for async/await
import 'regenerator-runtime/runtime';

import addStyles from 'wegit-lib/browser/utils/addStyles';
import styles from 'wegit-lib/browser/bootstrap.min.css';

import App from '../components/App';

// Main
// =============================================================================

const main = async () => {
  document.documentElement.innerHTML = '<head></head><body><div></div></body>';
  addStyles(styles);
  ReactDOM.render(
    <App utils={{ addStyles, styles }} />,
    document.getElementsByTagName('div')[0],
  );
};

main();
