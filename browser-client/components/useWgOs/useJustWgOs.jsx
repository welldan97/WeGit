// Imports
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import adapter from 'webrtc-adapter';

import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import log from './log';

// Main
// =============================================================================

export default function useJustWgOs({ config, user, onChange }) {
  const setIsReady = useState(false)[1];
  const wgOsRef = useRef(undefined);

  useEffect(() => {
    if (wgOsRef.current !== undefined) return;

    wgOsRef.current = new WgOs({
      config,
      user,
      log,
    });

    wgOsRef.current.on('mesh:change', onChange);
    wgOsRef.current.on('users:change', onChange);

    window.wgOs = wgOsRef.current;
    setIsReady(true);
  });

  return { wgOs: wgOsRef.current };
}
