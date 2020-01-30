// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import adapter from 'webrtc-adapter';

import { toWgKey, fromWgKey } from 'wegit-lib/wgOs/wgKey';
import 'wegit-lib/browser/bootstrap.min.css';

import copyToClipboard from '../../lib/copyToClipboard';

import useJustWgOs from './useJustWgOs';

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
  const [meshState, setMeshState] = useState({
    connections: [],
    globalState: 'disconnected',
  });
  const [clipboardIsWorking, setClipboardIsWorking] = useState(false);
  const [peerIsConnecting, setPeerIsConnecting] = useState(false);
  const [networkAlert, baseSetNetworkAlert] = useState(undefined);
  const setNetworkAlert = state => {
    baseSetNetworkAlert(state);
    setTimeout(() => baseSetNetworkAlert(undefined), 7000);
  };

  const [wgOfferKeyForInvite, setWgOfferKeyForInvite] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const currentConnectionIdRef = useRef(undefined);

  useEffect(() => {
    if (networkTabState === 'step1') {
      setWgOfferKeyForInvite('');
      setWgAnswerKeyForJoin('');
      setClipboardIsWorking(false);
      setPeerIsConnecting(false);
      currentConnectionIdRef.current = undefined;
    } else {
      setNetworkAlert(undefined);
    }
  }, [networkTabState]);

  const onChange = useCallback(
    ({ wgOs }) => {
      if (!wgOs) return;
      const baseMeshState = wgOs.getMeshState();
      const meshState = {
        connections: baseMeshState.connections.map(c => ({
          ...c,
          user: wgOs.users.find(u => u.id === c.peer),
        })),
        globalState: baseMeshState.globalState,
      };
      const currentConnection = meshState.connections.find(
        c => c.id === currentConnectionIdRef.current,
      );

      // Happens when connection got closed, i.e. when canceled
      if (currentConnectionIdRef.current && !currentConnection) {
        setNetworkTabState('step1');
      }

      // When initiator connection feels that another one is connecting -
      //   go to step 3 automatically
      else if (
        currentConnection &&
        currentConnection.state === 'connecting' &&
        networkTabState === 'step2invite'
      ) {
        setPeerIsConnecting(true);
        setNetworkTabState('step3invite');
      }

      // When connection established go to step 1
      else if (currentConnection && currentConnection.state === 'connected') {
        setNetworkAlert({
          message: '🎉 Woop woop! Your connection has been created',
          type: 'success',
        });
        setNetworkTabState('step1');
      }
      setMeshState(meshState);
    },
    [networkTabState],
  );
  const { wgOs } = useJustWgOs({
    config,
    user,
    onChange,
  });
  const onError = () => {
    setNetworkAlert({
      message: '💀 Oops! something went wrong. Try to reinitiate connection',
      type: 'danger',
    });
    setNetworkTabState('step1');
  };
  const invite = async () => {
    if (!wgOs) return;
    try {
      setNetworkTabState('step2invite');
      const { wgConnection, wgOffer } = await wgOs.invite();
      currentConnectionIdRef.current = wgConnection.id;
      const wgOfferKey = toWgKey('wgOffer')(wgOffer);
      setWgOfferKeyForInvite(wgOfferKey);
      const clipboardIsWorking = copyToClipboard(wgOfferKey);
      setClipboardIsWorking(clipboardIsWorking);
    } catch (e) {
      onError();
    }
  };
  const startEstablishing = () => setNetworkTabState('step3invite');
  const establish = async wgAnswerKey => {
    try {
      await wgOs.establish(fromWgKey(wgAnswerKey));
    } catch (e) {
      onError();
    }
  };
  const startJoining = () => setNetworkTabState('step2join');
  const join = async wgOfferKey => {
    if (!wgOs) return;
    try {
      setNetworkTabState('step3join');
      const { wgConnection, wgAnswer } = await wgOs.join(fromWgKey(wgOfferKey));
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentConnectionIdRef.current = wgConnection.id;
      const wgAnswerKey = toWgKey('wgAnswer')(wgAnswer);
      setWgAnswerKeyForJoin(wgAnswerKey);
      const clipboardIsWorking = copyToClipboard(wgAnswerKey);
      setClipboardIsWorking(clipboardIsWorking);
    } catch (e) {
      onError();
    }
  };
  const cancelConnection = () => {
    if (!currentConnectionIdRef.current) {
      setNetworkTabState('step1');
      return;
    }
    wgOs.close(currentConnectionIdRef.current);
  };
  const closeConnection = id => {
    wgOs.close(id);
  };
  return {
    networkTabState,
    meshState,
    networkAlert,
    clipboardIsWorking,
    peerIsConnecting,
    wgOfferKeyForInvite,
    invite,
    startEstablishing,
    establish,
    wgAnswerKeyForJoin,
    startJoining,
    join,
    cancelConnection,
    closeConnection,
  };
}
