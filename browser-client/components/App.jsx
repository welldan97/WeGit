// Imports
// =============================================================================

import React, { useState } from 'react';

import Navbar from './Navbar';
import RunningAppTab from './RunningAppTab';
import AppsTab from './AppsTab';
import NetworkTab from './NetworkTab';
import SettingsTab from './SettingsTab';

import useWgOs from './useWgOs';

// Main
// =============================================================================

export default function App({ utils }) {
  const {
    config,
    currentUser,
    users,
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
    onDeleteApp,
  } = useWgOs();

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
          users={users}
          transport={transport}
          utils={utils}
          isShown={mainTabState === 'runningApp'}
        />
        {mainTabState !== 'runningApp' && (
          <div className="container" style={{ maxWidth: '720px' }}>
            {mainTabState === 'apps' && (
              <AppsTab
                apps={apps}
                onCreate={onCreateApp}
                onRun={onRunApp}
                onDelete={onDeleteApp}
              />
            )}
            {mainTabState === 'network' && (
              <NetworkTab
                {...{
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
            {mainTabState === 'settings' && (
              <SettingsTab
                config={config}
                user={currentUser}
                onUpdateSettings={onUpdateSettings}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
