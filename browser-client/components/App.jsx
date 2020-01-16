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
    wgOfferKeyForCreate,
    wgAnswerKeyForJoin,
    createConnection,
    joinConnection,
    establishConnection,
  } = useWgOs();

  return (
    <>
      <Navbar active={active} onActivate={setActive} />
      <main role="main">
        {active === 'network' && (
          <NetworkTab
            createConnection={createConnection}
            establishConnection={establishConnection}
            joinConnection={joinConnection}
            wgOfferKeyForCreate={wgOfferKeyForCreate}
            wgAnswerKeyForJoin={wgAnswerKeyForJoin}
          />
        )}
      </main>
    </>
  );
}
