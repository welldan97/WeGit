// Imports
// =============================================================================

import React, { useState } from 'react';

import Navbar from './Navbar';
import NetworkTab from './NetworkTab';

import useWgOs from './useWgOs';

// Main
// =============================================================================

export default function App() {
  const [active, setActive] = useState('network');

  const {
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
  } = useWgOs();

  return (
    <>
      <Navbar active={active} onActivate={setActive} meshState={meshState} />
      <main role="main">
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
      </main>
    </>
  );
}
