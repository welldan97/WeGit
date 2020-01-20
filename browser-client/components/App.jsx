// Imports
// =============================================================================

import React, { useState } from '../lib/shims/React';
import 'wegit-lib/browser/bootstrap.min.css';

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

    wgOfferKeyForCreate,
    createConnection,
    establishConnection,

    wgAnswerKeyForJoin,
    startJoiningConnection,
    joinConnection,

    cancelConnection,
  } = useWgOs();

  return (
    <>
      <Navbar active={active} onActivate={setActive} />
      <main role="main">
        {active === 'network' && (
          <NetworkTab
            networkTabState={networkTabState}
            meshState={meshState}
            wgOfferKeyForCreate={wgOfferKeyForCreate}
            createConnection={createConnection}
            establishConnection={establishConnection}
            wgAnswerKeyForJoin={wgAnswerKeyForJoin}
            startJoiningConnection={startJoiningConnection}
            joinConnection={joinConnection}
            cancelConnection={cancelConnection}
          />
        )}
      </main>
    </>
  );
}
