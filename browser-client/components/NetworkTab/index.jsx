// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

import Tabs from './Tabs';
import CreateTab from './CreateTab';
import JoinTab from './JoinTab';

// Main
// =============================================================================

export default function NetworkTab({
  meshState,

  currentConnectionId,
  wgOfferKeyForCreate,
  wgAnswerKeyForJoin,

  createConnection,
  joinConnection,
  establishConnection,
}) {
  const [active, setActive] = useState('create');

  return (
    <div className="container">
      <h2>Network</h2>
      <p>
        {meshState.state === 'connected' && (
          <span className="text-success">✅connected</span>
        )}
        {meshState.state === 'connecting' && (
          <span className="text-info">⏳connecting</span>
        )}
        {meshState.state === 'disconnected' && (
          <span className="text-danger">❌disconnected</span>
        )}
      </p>
      <Tabs active={active} onActivate={setActive} />
      {active === 'create' && (
        <CreateTab
          currentConnectionId={currentConnectionId}
          wgOfferKey={wgOfferKeyForCreate}
          createConnection={createConnection}
          establishConnection={establishConnection}
        />
      )}
      {active === 'join' && (
        <JoinTab
          currentConnectionId={currentConnectionId}
          wgAnswerKey={wgAnswerKeyForJoin}
          joinConnection={joinConnection}
        />
      )}
    </div>
  );
}
