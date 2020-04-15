// Imports
// =============================================================================

import React, { memo, useEffect, useRef, useState } from 'react';

import appShellSource from '../../entries/appShellSource';

// Utils
// =============================================================================

const getIframeOptions = ({ iframeMode, id }) => {
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
  else if (iframeMode.type === 'crossOrigin')
    return {
      src: iframeMode.url.replace('{id}', id),
      sandbox: 'allow-scripts',
    };
  throw new Error('Wrong iframeMode.type');
};

const Loading = () => (
  <span
    style={{
      position: 'absolute',
      margin: 0,
      fontFamily:
        "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      backgroundColor: '#2B3E50',
      color: 'white',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      textAlign: 'center',
      paddingTop: '48vh',
    }}
  >
    Loading…
  </span>
);

// Main
// =============================================================================

export default memo(
  function Iframe({ iframeMode, transport, isReady, id }) {
    const ref = useRef(undefined);
    const [isTransportInitialized, setIsTransportInitialized] = useState(false);

    // Initialize transport
    useEffect(() => {
      if (!ref) return;
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
      if (iframeMode.type === 'sameOrigin')
        setTimeout(() => ref.current.contentWindow.eval(appShellSource));
    }, [ref]);

    const { src, sandbox } = getIframeOptions({ iframeMode, id });

    const style = {
      width: '100%',
      height: '100%',
      border: 'none',
      display: isReady ? 'block' : 'none',
    };
    return (
      <div style={{ position: 'relative' }}>
        {!isReady && <Loading />}
        <iframe src={src} style={style} sandbox={sandbox} ref={ref}></iframe>
      </div>
    );
  },
  // Only update when isReady changed
  (prevProps, nextProps) => prevProps.isReady === nextProps.isReady,
);
