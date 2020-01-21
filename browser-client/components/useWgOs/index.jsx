// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import adapter from 'webrtc-adapter';

import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import uuid from '../../lib/uuid';
import copyToClipboard from '../../lib/copyToClipboard';

import log from './log';

// Main
// =============================================================================

const userName = Math.random()
  .toString(36)
  .substring(7);

const user = { userName };

// NOTE: public servers list:
//   https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b
const config = {
  iceServers: [
    { urls: 'stun:stun3.l.google.com:19302' },
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com',
    },
  ],
};

export default function useWgOs() {
  const [networkTabState, setNetworkTabState] = useState('step1');
  const [wgOfferKeyForCreate, setWgOfferKeyForCreate] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const [meshState, setMeshState] = useState({
    connections: [],
    state: 'disconnected',
  });

  const wgOsRef = useRef(undefined);
  // NOTE: for some reason onChange doesn't get networkTabState or other
  // useState right, thus   using this
  const networkTabStateRef = useRef(undefined);
  useEffect(() => {
    networkTabStateRef.current = networkTabState;

    if (networkTabState === 'step1') {
      setWgOfferKeyForCreate('');
      setWgAnswerKeyForJoin('');
    }
  }, [networkTabState]);

  const currentConnectionIdRef = useRef(undefined);

  const getCurrentConnection = () => {
    if (!currentConnectionIdRef.current) return;
    if (!wgOsRef.current) return;
    const meshState = wgOsRef.current.getMeshState();

    return meshState.connections.find(
      c => c.id === currentConnectionIdRef.current,
    );
  };

  const onChange = useCallback(() => {
    const currentConnection = getCurrentConnection();

    if (!currentConnection) {
      setNetworkTabState('step1');
      currentConnectionIdRef.current = undefined;
    }

    if (
      currentConnection &&
      currentConnection.state === 'connecting' &&
      networkTabStateRef.current === 'step2create'
    ) {
      setNetworkTabState('step3create');
    }

    if (currentConnection && currentConnection.state === 'connected') {
      setNetworkTabState('step1');
    }

    setMeshState(wgOsRef.current.getMeshState());
  });

  useEffect(() => {
    if (wgOsRef.current !== undefined) return;

    const wrtc = { RTCPeerConnection, RTCSessionDescription };
    wgOsRef.current = new (WgOs({
      Event,
      // NOTE: in long run EventTarget should be avoided. Here we have to use
      // Element, because it's not supported on safari
      EventTarget: () => document.createElement('div'),
      uuid,
      wrtc,
      log,
    }))({
      config,
      user,
    });

    wgOsRef.current.eventTarget.addEventListener('change', () => onChange());

    window.wgOs = wgOsRef.current;
  });

  const createConnection = async () => {
    const { wgConnection, wgOfferKey } = await wgOsRef.current.create();

    currentConnectionIdRef.current = wgConnection.id;
    setNetworkTabState('step2create');
    setWgOfferKeyForCreate(wgOfferKey);

    copyToClipboard(wgOfferKey);
  };

  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(wgAnswerKey);
  };

  const startJoiningConnection = () => setNetworkTabState('step2join');

  const joinConnection = async wgOfferKey => {
    const { wgConnection, wgAnswerKey } = await wgOsRef.current.join(
      wgOfferKey,
    );

    currentConnectionIdRef.current = wgConnection.id;
    setNetworkTabState('step3join');

    setWgAnswerKeyForJoin(wgAnswerKey);
    copyToClipboard(wgAnswerKey);
  };

  const cancelConnection = () => {
    if (!currentConnectionIdRef.current) {
      setNetworkTabState('step1');
      return;
    }

    wgOsRef.current.closeConnection(currentConnectionIdRef.current);
  };

  return {
    networkTabState,
    meshState,

    wgOfferKeyForCreate,
    createConnection,
    establishConnection,

    wgAnswerKeyForJoin,
    startJoiningConnection,
    joinConnection,

    cancelConnection,
  };
}
