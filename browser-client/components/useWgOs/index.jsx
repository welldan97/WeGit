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
  const [currentConnectionId, setCurrentConnectionId] = useState(undefined);
  const [wgOfferKeyForCreate, setWgOfferKeyForCreate] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const [meshState, setMeshState] = useState({
    peers: [],
    state: 'disconnected',
  });

  const wgOsRef = useRef(null);
  // NOTE: for some reason onChange doesn't get currentConnectionId right, thus
  //   using this
  const currentConnectionIdRef = useRef(null);

  const onChange = useCallback(() => {
    const nextMeshState = wgOsRef.current.getMeshState();

    const currentConnection =
      currentConnectionIdRef.current &&
      nextMeshState.connections.find(
        c => c.id === currentConnectionIdRef.current,
      );

    if (currentConnection && currentConnection.state === 'connected') {
      setCurrentConnectionId(undefined);
      setWgOfferKeyForCreate('');
      setWgAnswerKeyForJoin('');
    }
    setMeshState(wgOsRef.current.getMeshState());
  }, []);

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

    setCurrentConnectionId(wgConnection.id);
    currentConnectionIdRef.current = wgConnection.id;
    setWgOfferKeyForCreate(wgOfferKey);

    await navigator.clipboard.writeText(wgOfferKey);
  };

  const joinConnection = async wgOfferKey => {
    const { wgConnection, wgAnswerKey } = await wgOsRef.current.join(
      wgOfferKey,
    );

    setCurrentConnectionId(wgConnection.id);
    currentConnectionIdRef.current = wgConnection.id;

    setWgAnswerKeyForJoin(wgAnswerKey);

    navigator.clipboard.writeText(wgAnswerKey);
  };

  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(wgAnswerKey);
  };

  return {
    meshState,

    currentConnectionId,
    wgOfferKeyForCreate,
    wgAnswerKeyForJoin,

    createConnection,
    joinConnection,
    establishConnection,
  };
}
