// Imports
// =============================================================================

import adapter from 'webrtc-adapter';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import _isEqual from 'lodash/isEqual';

import { toWgKey, fromWgKey } from 'wegit-lib/utils/wgKey';
import 'wegit-lib/browser/bootstrap.min.css';

import copyToClipboard from '../../lib/copyToClipboard';

import useJustWgOs from './useJustWgOs';

// Main
// =============================================================================
const WeBlankApp = {
  id: 'WE-WE-WE-WE-WE--BLANK',
  name: 'WeBlank',
  description: '',
  icon: '\u{1F932}',
  user: { userName: 'welldan97' },
  source: '',
};

const initialApps = [WeBlankApp];

// NOTE: public servers list:
//   https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b

const defaultSettings = {
  config: {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  },
  currentUser: { userName: undefined, type: 'browser' },
};

const weGitSettingsCookie = Cookies.get('weGit');
const weGitSettingsCookieObject = weGitSettingsCookie
  ? JSON.parse(weGitSettingsCookie)
  : {};
const weGitSettings = {
  ...defaultSettings,
  ...weGitSettingsCookieObject,
  currentUser: {
    ...weGitSettingsCookieObject.currentUser,
    type: 'browser',
  },
};

const { config, currentUser: initialCurrentUser } = weGitSettings;

export default function useWgOs() {
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);
  const [apps, setApps] = useState([]);
  const [runningApp, setRunningApp] = useState(undefined);

  const [mainTabState, setMainTabState] = useState('apps' || 'network');
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
      setApps(wgOs.apps);
      setCurrentUser(wgOs.currentUser);
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
          message: '\u{1f389} Woop woop! Your connection has been created',
          type: 'success',
        });
        setNetworkTabState('step1');
      }
      setMeshState(meshState);
    },
    [networkTabState],
  );
  // Initialization

  const { isReady, wgOs, transport } = useJustWgOs({
    config,
    currentUser,
    apps: initialApps,
    onChange,
  });

  useEffect(() => {
    if (!isReady) return;
    setApps(wgOs.apps);
  }, [wgOs]);

  const onError = () => {
    setNetworkAlert({
      message:
        '\u{1f480} Oops! something went wrong. Try to reinitiate connection',
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

  const onUpdateSettings = nextSettings => {
    const { user, config: nextConfig } = nextSettings;
    setCurrentUser(user);
    wgOs.saveCurrentUser(user);

    Cookies.set('weGit', {
      config: nextConfig,
      currentUser: { userName: user.userName },
    });
    if (!_isEqual(config, nextConfig)) {
      location.reload(true);
    }
  };

  const onCreateApp = app => {
    wgOs.saveApps([app]);
  };

  const onRunApp = appId => {
    setRunningApp(wgOs.apps.find(a => a.id === appId));
    setMainTabState('runningApp');
  };

  const onStopApp = () => {
    setRunningApp(undefined);
    transport.setOnMessage(() => {});
  };

  const onDeleteApp = appId => {
    wgOs.deleteApp(appId);
  };

  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!apps.length) return;
    if (isInitialized) return;
    setTimeout(async () => {
      // TODO: DEV
      onRunApp(apps[0].id);
      const { wgOffer } = await wgOs.invite();
      const wgOfferKey = toWgKey('wgOffer')(wgOffer);
      const response = await fetch('http://localhost:1236', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wgOfferKey }),
      });
      const { wgAnswerKey } = await response.json();
      await wgOs.establish(fromWgKey(wgAnswerKey));
    });
    setIsInitialized(true);
  }, [apps]);

  return {
    config,
    currentUser,
    apps,

    mainTabState,
    setMainTabState,
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

    onUpdateSettings,

    runningApp,
    transport,
    onCreateApp,
    onRunApp,
    onStopApp,
    onDeleteApp,
  };
}
