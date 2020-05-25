// ==WgApp==
// @name WeSharedState
// @description Example of shared state
// @icon '\u{1F916}'
// @user { "userName": "welldan97" }
// ==/WgApp==

// Imports
// =============================================================================
import React from 'react';
import ReactDOM from 'react-dom';
// NOTE: necessary for async/await
import 'regenerator-runtime/runtime';

import App from './components/App';

// Main
// =============================================================================
const main = () => {
  document.body.innerHTML = '<div></div>';
  ReactDOM.render(
    <App AppShell={AppShell} />,
    document.getElementsByTagName('div')[0],
  );
};

if (typeof module !== 'undefined') module.exports = main;
else main();
