// Imports
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import adapter from 'webrtc-adapter';

import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import log from './log';

// Main
// =============================================================================

export default function useJustWgOs({
  config,
  signalling,
  currentUser,
  apps,
  onChange,
}) {
  const [isReady, setIsReady] = useState(false);
  const wgOsRef = useRef(undefined);
  const onChangeRef = useRef(onChange);
  const onMessageRef = useRef(() => {});

  useEffect(() => {
    if (!isReady) return;
    onChangeRef.current({ wgOs: wgOsRef.current });
  }, [isReady]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const transportRef = useRef({
    send(...args) {
      return wgOsRef.current.send(...args);
    },
    sendAll(...args) {
      return wgOsRef.current.sendAll(...args);
    },
    sendBack(...args) {
      onMessageRef.current(...args);
    },
    setOnMessage: onMessage => {
      onMessageRef.current = onMessage;
    },
  });

  useEffect(() => {
    if (wgOsRef.current !== undefined) return;

    wgOsRef.current = new WgOs({
      config,
      signalling,
      currentUser,
      apps,
      //log,
    });

    wgOsRef.current.on('mesh:change', (...args) =>
      onChangeRef.current(...args),
    );

    wgOsRef.current.on('users:change', (...args) =>
      onChangeRef.current(...args),
    );

    wgOsRef.current.on('apps:change', (...args) =>
      onChangeRef.current(...args),
    );

    wgOsRef.current.on('message', (...args) => onMessageRef.current(...args));

    window.wgOs = wgOsRef.current;
    setIsReady(true);
  });

  return { isReady, wgOs: wgOsRef.current, transport: transportRef.current };
}
