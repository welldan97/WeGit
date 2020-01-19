// Imports
// =============================================================================

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../../lib/shims/React';
import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import uuid from '../../lib/uuid';

import log from './log';

// Main
// =============================================================================

const userName = Math.random()
  .toString(36)
  .substring(7);

const user = { userName };

export default function useWgOs() {
  //const [currentConnection, setCurrentConnection] = useState(undefined);
  const [networkTabState, setNetworkTabState] = useState('step1');
  const [wgOfferKeyForCreate, setWgOfferKeyForCreate] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const [meshState, setMeshState] = useState({
    peers: [],
    state: 'disconnected',
  });

  const wgOsRef = useRef(null);
  // NOTE: for some reason onChange doesn't get networkTabState or other
  // useState right, thus   using this
  const networkTabStateRef = useRef(null);
  useEffect(() => {
    networkTabStateRef.current = networkTabState;

    if (networkTabState === 'step1') {
      setWgOfferKeyForCreate('');
      setWgAnswerKeyForJoin('');
    }
  }, [networkTabState]);

  const currentConnectionIdRef = useRef(null);

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
    if (wgOsRef.current !== null) return;

    const wrtc = { RTCPeerConnection, RTCSessionDescription };
    wgOsRef.current = new (WgOs({
      Event,
      EventTarget,
      uuid,
      wrtc,
      log,
    }))({
      user,
    });

    wgOsRef.current.addEventListener('change', () => onChange());

    window.wgOs = wgOsRef.current;
  });

  const createConnection = async () => {
    const { wgConnection, wgOfferKey } = await wgOsRef.current.create();

    currentConnectionIdRef.current = wgConnection.id;
    setNetworkTabState('step2create');
    setWgOfferKeyForCreate(wgOfferKey);

    await navigator.clipboard.writeText(wgOfferKey);
  };

  const startJoiningConnection = () => setNetworkTabState('step2join');

  const joinConnection = async wgOfferKey => {
    const { wgConnection, wgAnswerKey } = await wgOsRef.current.join(
      wgOfferKey,
    );

    currentConnectionIdRef.current = wgConnection.id;
    setNetworkTabState('step3join');

    setWgAnswerKeyForJoin(wgAnswerKey);

    navigator.clipboard.writeText(wgAnswerKey);
  };

  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(wgAnswerKey);
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
  };
}
