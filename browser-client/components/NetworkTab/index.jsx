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
}) {
  const [active, setActive] = useState('connect');
  return (
    <>
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
          }}
        />
      )}
      {active === 'peers' && (
        <PeersTab meshState={meshState} closeConnection={closeConnection} />
      )}
    </>
  );
}
