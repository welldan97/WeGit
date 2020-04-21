// Imports
// =============================================================================

import adapter from 'webrtc-adapter';

import { useCallback, useEffect, useRef, useState } from 'react';
import _isEqual from 'lodash/isEqual';

import { toWgKey, fromWgKey } from 'wegit-lib/utils/wgKey';
import parseAppSource from 'wegit-lib/utils/parseAppSource';
import 'wegit-lib/browser/bootstrap.min.css';
import httpsSignallingClient from 'wegit-signalling-https';
import firebaseSignallingClient from 'wegit-signalling-firebase';

import getConfig from '../../config';
import copyToClipboard from '../../lib/copyToClipboard';

import useJustWgOs from './useJustWgOs';

// Utils
// =============================================================================

const download = (filename, text) => {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

// Main
// =============================================================================

const defaultConfig = getConfig();
const {
  config: loadedConfig,
  currentUser: loadedCurrentUser,
  apps: loadedApps,
} = JSON.parse(localStorage.getItem('weGit') || '{}');

const initialConfig = defaultConfig.alwaysDefaultConfig
  ? defaultConfig
  : loadedConfig || defaultConfig;
const initialApps = loadedApps || defaultConfig.initialApps;
const initialCurrentUser = loadedCurrentUser || {
  userName: undefined,
  type: 'browser',
};

const signalling = {
  https: httpsSignallingClient,
  firebase: firebaseSignallingClient,
};

export default function useWgOs({ source }) {
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);
  const [config, setConfig] = useState(initialConfig);
  const [apps, setApps] = useState(initialApps);
  const [runningApp, setRunningApp] = useState(undefined);

  const [mainTabState, setMainTabState] = useState(initialConfig.tab);
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
    if (config.serviceWorkers && 'serviceWorker' in navigator)
      navigator.serviceWorker.register('/service-worker.js');
  }, []);

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

  const { /*isReady,*/ wgOs, transport } = useJustWgOs({
    config: {
      iceServers: config.iceServers,
    },
    signalling:
      config.signalling &&
      signalling[config.signalling.type](config.signalling.options),
    currentUser,
    apps,
    onChange,
  });

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
      const { wgConnection, wgOffer } = await wgOs.invite();
      if (!wgConnection) return;
      setNetworkTabState('step2invite');
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
      const { wgConnection, wgAnswer } = await wgOs.join(fromWgKey(wgOfferKey));
      if (!wgConnection) return;
      setNetworkTabState('step3join');

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
    setConfig(nextConfig);
    wgOs.saveCurrentUser(user);

    if (!_isEqual(config, nextConfig))
      setTimeout(() => location.reload(true), 300);
  };

  const onResetSettings = async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) registration.unregister();
      } catch (e) {
        //
      }
    }
    setTimeout(() => location.reload(true), 300);
  };

  useEffect(() => {
    localStorage.setItem(
      'weGit',
      JSON.stringify({
        config,
        currentUser,
        apps,
      }),
    );
  }, [apps, config, currentUser]);

  const onCreateApp = app => {
    if (app.source.startsWith('// ==WgApp=='))
      wgOs.saveApps([parseAppSource(app.source)]);
    else wgOs.saveApps([app]);
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
    if (runningApp && runningApp.id === appId) onStopApp();
    wgOs.deleteApp(appId);
  };

  const onDownload = () => {
    download('WeGit.html', source);
  };

  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!wgOs) return;

    if (!apps.length) return;
    if (isInitialized) return;

    if (config.runApp) setTimeout(() => onRunApp(apps[0].id));
    setIsInitialized(true);
  }, [apps, wgOs]);

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
    onResetSettings,

    runningApp,
    transport,
    onCreateApp,
    onRunApp,
    onStopApp,
    onDeleteApp,

    onDownload,
  };
}
