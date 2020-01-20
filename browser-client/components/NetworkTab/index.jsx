// Imports
// =============================================================================

import React from '../../lib/shims/React';

import Step1 from './Step1';
import Step2Create from './Step2Create';
import Step3Create from './Step3Create';
import Step2Join from './Step2Join';
import Step3Join from './Step3Join';

// Main
// =============================================================================

export default function NetworkTab({
  networkTabState,
  meshState,

  wgOfferKeyForCreate,
  createConnection,
  establishConnection,

  wgAnswerKeyForJoin,
  startJoiningConnection,
  joinConnection,

  cancelConnection,
}) {
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
      {networkTabState === 'step1' && (
        <Step1
          meshState={meshState}
          createConnection={createConnection}
          startJoiningConnection={startJoiningConnection}
        />
      )}
      {networkTabState === 'step2create' && (
        <Step2Create
          wgOfferKey={wgOfferKeyForCreate}
          cancelConnection={cancelConnection}
        />
      )}
      {networkTabState === 'step3create' && (
        <Step3Create
          establishConnection={establishConnection}
          cancelConnection={cancelConnection}
        />
      )}

      {networkTabState === 'step2join' && (
        <Step2Join
          joinConnection={joinConnection}
          cancelConnection={cancelConnection}
        />
      )}

      {networkTabState === 'step3join' && (
        <Step3Join
          wgAnswerKey={wgAnswerKeyForJoin}
          cancelConnection={cancelConnection}
        />
      )}
    </div>
  );
}
