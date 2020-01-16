// Imports
// =============================================================================

import React, { useState } from '../../lib/shims/React';

import Tabs from './Tabs';
import CreateTab from './CreateTab';
import JoinTab from './JoinTab';

// Main
// =============================================================================

export default function NetworkTab({
  wgOfferKeyForCreate,
  wgAnswerKeyForJoin,
  createConnection,
  joinConnection,
  establishConnection,
}) {
  const isConnected = false;
  const [active, setActive] = useState('create');

  return (
    <div className="container">
      <h2>Network</h2>
      <p>
        {isConnected ? (
          <span className="text-success">✅connected</span>
        ) : (
          <span className="text-danger">❌disconnected</span>
        )}
      </p>
      <Tabs active={active} onActivate={setActive} />
      {active === 'create' && (
        <CreateTab
          wgOfferKey={wgOfferKeyForCreate}
          createConnection={createConnection}
          establishConnection={establishConnection}
        />
      )}
      {active === 'join' && (
        <JoinTab
          wgAnswerKey={wgAnswerKeyForJoin}
          joinConnection={joinConnection}
        />
      )}
    </div>
  );
}
