// Imports
// =============================================================================

import { useEffect, useRef, useState } from '../lib/shims/React';
import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import uuid from '../lib/uuid';

// Main
// =============================================================================

const userName = Math.random()
  .toString(36)
  .substring(7);

const user = { userName };

export default function useWgOs() {
  const [wgOfferKeyForCreate, setWgOfferKeyForCreate] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const wgOsRef = useRef(null);

  useEffect(() => {
    if (wgOsRef.current !== null) return;
    const wrtc = { RTCPeerConnection, RTCSessionDescription };

    wgOsRef.current = new (WgOs({ Event, EventTarget, uuid, wrtc }))({
      user,
    });
  });

  const createConnection = async () => {
    const { wgOfferKey } = await wgOsRef.current.create();
    setWgOfferKeyForCreate(wgOfferKey);

    await navigator.clipboard.writeText(wgOfferKey);
  };

  const joinConnection = async wgOfferKey => {
    const { wgAnswerKey } = await wgOsRef.current.join(wgOfferKey);
    setWgAnswerKeyForJoin(wgAnswerKey);

    navigator.clipboard.writeText(wgAnswerKey);
  };
  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(wgAnswerKey);
  };

  return {
    wgOfferKeyForCreate,
    wgAnswerKeyForJoin,
    createConnection,
    joinConnection,
    establishConnection,
  };
}
