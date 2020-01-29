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
  } = useWgOs();

  return (
    <>
      <Navbar active={active} onActivate={setActive} />
      <main role="main">
        {active === 'network' && (
          <NetworkTab
            {...{
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
            }}
          />
        )}
      </main>
    </>
  );
}
