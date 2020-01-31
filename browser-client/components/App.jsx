// Imports
// =============================================================================

import React, { useState } from 'react';

import Navbar from './Navbar';
import NetworkTab from './NetworkTab';
import SettingsTab from './SettingsTab';

import useWgOs from './useWgOs';

// Main
// =============================================================================

export default function App() {
  const [active, setActive] = useState('settings' || 'network');

  const {
    config,
    user,

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
  } = useWgOs();

  return (
    <>
      <Navbar
        active={active}
        onActivate={setActive}
        meshState={meshState}
        userName={user.userName}
      />
      <main role="main">
        <div className="container" style={{ maxWidth: '720px' }}>
          {active === 'network' && (
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
          {active === 'settings' && (
            <SettingsTab
              config={config}
              user={user}
              onUpdateSettings={onUpdateSettings}
            />
          )}
        </div>
      </main>
    </>
  );
}
