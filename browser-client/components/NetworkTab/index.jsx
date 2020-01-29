// Imports
// =============================================================================

import React, { useState } from 'react';

import MeshState from './MeshState';
import Tabs from './Tabs';
import ConnectTab from './ConnectTab';
import PeersTab from './PeersTab';

// Main
// =============================================================================

export default function NetworkTab({
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
}) {
  const [active, setActive] = useState('connect');
  return (
    <div className="container">
      <h2>Network</h2>
      <MeshState state={meshState.globalState} />
      <Tabs
        active={active}
        onActivate={setActive}
        connectingPeersCount={
          meshState.connections.filter(
            c => c.state === 'connecting' || c.state === 'new',
          ).length
        }
        connectedPeersCount={
          meshState.connections.filter(c => c.state === 'connected').length
        }
      />
      {active === 'connect' && (
        <ConnectTab
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
          }}
        />
      )}
      {active === 'peers' && (
        <PeersTab meshState={meshState} closeConnection={closeConnection} />
      )}
    </div>
  );
}
