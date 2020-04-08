// Imports
// =============================================================================

import React, { memo, useEffect, useRef, useState } from 'react';

import { readFileSync } from 'fs';

// NOTE: parcel builder loads it and replace it with contents automatically
// https://github.com/parcel-bundler/parcel/issues/970#issuecomment-381403710
const appShellSource = readFileSync(
  __dirname + '../../../dist/appShell.js',
  'utf-8',
);

// Utils
// =============================================================================

const getIframeOptions = iframeMode => {
  //const sandbox = 'allow-same-origin allow-scripts';

  if (iframeMode.type === 'development')
    return {
      src: iframeMode.url,
      sandbox: undefined,
    };
  else if (iframeMode.type === 'sameOrigin')
    return {
      src: undefined,
      sandbox: undefined,
    };
};

// Main
// =============================================================================

export default memo(
  function Iframe({ iframeMode, transport, isReady }) {
    const ref = useRef(undefined);
    const [isTransportInitialized, setIsTransportInitialized] = useState(false);

    // Initialize transport
    useEffect(() => {
      if (isTransportInitialized) return;

      transport.setOnMessage(message => {
        if (!message.type.startsWith('app:')) return;
        if (!ref.current || !ref.current.contentWindow) return;
        ref.current.contentWindow.postMessage(
          {
            ...message,
            type: message.type.replace(/^app:/, ''),
          },
          '*',
        );
      });
      setIsTransportInitialized(true);
    }, []);

    const { src, sandbox } = getIframeOptions(iframeMode);

    const style = {
      width: '100%',
      height: '100%',
      border: 'none',
      display: isReady ? 'block' : 'none',
    };

    return (
      <iframe src={src} style={style} sandbox={sandbox} ref={ref}></iframe>
    );
  },
  // Only update when isReady changed
  (prevProps, nextProps) => prevProps.isReady === nextProps.isReady,
);
