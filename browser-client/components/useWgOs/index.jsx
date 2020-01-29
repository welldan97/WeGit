// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import adapter from 'webrtc-adapter';

import WgOs from 'wegit-lib/WgOs';
import { toWgKey, fromWgKey } from 'wegit-lib/wgOs/wgKey';
import 'wegit-lib/browser/bootstrap.min.css';

import uuid from '../../lib/uuid';
import copyToClipboard from '../../lib/copyToClipboard';

import log from './log';
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

  const [wgOfferKeyForInvite, setWgOfferKeyForInvite] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');

  const currentConnectionIdRef = useRef(undefined);

  useEffect(() => {
    if (networkTabState === 'step1') {
      setWgOfferKeyForInvite('');
      setWgAnswerKeyForJoin('');
      currentConnectionIdRef.current = undefined;
    }
  }, [networkTabState]);

  const onChange = useCallback(
    ({ wgOs }) => {
      console.log(networkTabState);
      if (!wgOs) return;
      const meshState = wgOs.getMeshState();

      const currentConnection = meshState.connections.find(
        c => c.id === currentConnectionIdRef.current,
      );

      // Happens when connection got closed, i.e. when canceled
      if (currentConnectionIdRef.current && !currentConnection) {
        setNetworkTabState('step1');
      }

      // When initiator connections feels like another one is connecting -
      //   go to step 3 automatically
      else if (
        currentConnection &&
        currentConnection.state === 'connecting' &&
        networkTabState === 'step2invite'
      ) {
        setNetworkTabState('step3invite');
      }

      // When connection established go to step 1
      else if (currentConnection && currentConnection.state === 'connected') {
        setNetworkTabState('step1');
      }

      setMeshState(wgOs.getMeshState());
    },
    [networkTabState],
  );

  const { wgOs } = useJustWgOs({ config, user, onChange });

  const invite = async () => {
    if (!wgOs) return;

    setNetworkTabState('step2invite');

    const { wgConnection, wgOffer } = await wgOs.invite();
    currentConnectionIdRef.current = wgConnection.id;
    const wgOfferKey = toWgKey('wgOffer')(wgOffer);

    setWgOfferKeyForInvite(wgOfferKey);
    const clipboardIsWorking = copyToClipboard(wgOfferKey);
    setClipboardIsWorking(clipboardIsWorking);
  };

  const startEstablishingConnection = () => setNetworkTabState('step3invite');
  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(fromWgKey(wgAnswerKey));
  };

  const startJoiningConnection = () => setNetworkTabState('step2join');
  const joinConnection = useCallback(
    async wgOfferKey => {
      const { wgConnection, wgAnswer } = await wgOsRef.current.join(
        fromWgKey(wgOfferKey),
      );
      const wgAnswerKey = toWgKey('wgAnswer')(wgAnswer);
      currentConnectionIdRef.current = wgConnection.id;
      setNetworkTabState('step3join');

      setWgAnswerKeyForJoin(wgAnswerKey);
      copyToClipboard(wgAnswerKey);
    },
    [wgOs],
  );

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
    clipboardIsWorking,

    wgOfferKeyForInvite,
    invite,
    startEstablishingConnection,
    establishConnection,

    wgAnswerKeyForJoin,
    startJoiningConnection,
    joinConnection,

    cancelConnection,
    closeConnection,
  };
}
