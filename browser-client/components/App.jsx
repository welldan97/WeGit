// Imports
// =============================================================================

import React, { useEffect, useMemo } from 'react';

import Navbar from './Navbar';
import RunningAppTab from './RunningAppTab';
import AppsTab from './AppsTab';
import NetworkTab from './NetworkTab';
import ShareTab from './ShareTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';

import useWgOs from './useWgOs';

// Main
// =============================================================================

export default function App({ utils, source }) {
  const {
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
  } = useWgOs({ source });

  const connectedUsers = useMemo(
    () =>
      meshState.connections
        .filter(c => c.state === 'connected')
        .map(c => c.user),
    [meshState && meshState.connections],
  );

  useEffect(() => {
    document.body.style.transition = 'all 300ms ease 0s';
  });

  return (
    <>
      <Navbar
        active={mainTabState}
        onActivate={setMainTabState}
        runningApp={runningApp}
        meshState={meshState}
        userName={currentUser.userName}
      />
      <main role="main">
        <RunningAppTab
          runningApp={runningApp}
          currentUser={currentUser}
          users={connectedUsers}
          transport={transport}
          utils={utils}
          isShown={mainTabState === 'runningApp'}
          config={config}
          onCreateApp={onCreateApp}
        />
        {mainTabState !== 'runningApp' && (
          <div className="container" style={{ maxWidth: '720px' }}>
            {mainTabState === 'apps' && (
              <AppsTab
                apps={apps}
                runningApp={runningApp}
                onCreate={onCreateApp}
                onRun={onRunApp}
                onStop={onStopApp}
                onDelete={onDeleteApp}
              />
            )}
            {mainTabState === 'network' && (
              <NetworkTab
                {...{
                  currentUser,

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
                }}
              />
            )}
            {mainTabState === 'share' && <ShareTab onDownload={onDownload} />}
            {mainTabState === 'about' && <AboutTab />}
            {mainTabState === 'settings' && (
              <SettingsTab
                config={config}
                user={currentUser}
                onUpdateSettings={onUpdateSettings}
                onResetSettings={onResetSettings}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
