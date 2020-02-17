// Imports
// =============================================================================

import React, { memo, useEffect, useRef } from 'react';

import { readFileSync } from 'fs';

// NOTE: parcel builder loads it and replace it with contents automatically
// https://github.com/parcel-bundler/parcel/issues/970#issuecomment-381403710
const appShellSource = readFileSync(
  __dirname + '../../../dist/appShell.js',
  'utf-8',
);

// Utils
// =============================================================================

const mountAppShell = ({ transport, iframe, utils }) => {
  // 1. Add bootstrap styles
  iframe.contentWindow.eval(
    `(${utils.addStyles.toString()})("${JSON.stringify(utils.styles).slice(
      1,
      -1,
    )}")`,
  );

  // 2. Add shell base javascript

  iframe.contentWindow.eval(appShellSource);

  // 3. Pass messages to iframe

  transport.setOnMessage(message => {
    if (!message.type.startsWith('app:')) return;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        ...message,
        type: message.type.replace(/^app:/, ''),
      },
      '*',
    );
  });
};

// Main
// =============================================================================

export default memo(
  function Iframe({ transport, utils }) {
    const ref = useRef(undefined);

    useEffect(() => {
      if (!ref.current) return;
      if (!transport) return;

      mountAppShell({
        transport,
        iframe: ref.current,
        utils,
      });
    }, [ref.current]);

    const src = ''; // window.location.href;
    const sandbox = undefined;

    const style = {
      width: '100%',
      minHeight: '100%',
      border: 'none',
    };

    return (
      <iframe src={src} style={style} sandbox={sandbox} ref={ref}></iframe>
    );
  },
  /* are equal */ (/*prevProps, nextProps*/) => true,
);
