// Imports
// =============================================================================

import React from 'react';

import Progressbar from './Progressbar';
import Step1 from './Step1';
import Step2Invite from './Step2Invite';
import Step3Invite from './Step3Invite';
import Step2Join from './Step2Join';
import Step3Join from './Step3Join';

// Helpers
// =============================================================================

const getProgress = ({ networkTabState, wgOfferKeyForInvite }) => {
  switch (networkTabState) {
    case 'step1':
      return 0;
    case 'step2invite':
      if (!wgOfferKeyForInvite) return 25;
      return 50;
    case 'step2join':
      return 50;
    case 'step3invite':
    case 'step3join':
      return 75;
    default:
  }
};

// Main
// =============================================================================

export default function ConnectTab({
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
}) {
  return (
    <>
      <Progressbar
        progress={getProgress({ networkTabState, wgOfferKeyForInvite })}
      />
      {networkTabState === 'step1' && (
        <Step1
          meshState={meshState}
          invite={invite}
          startJoiningConnection={startJoiningConnection}
        />
      )}
      {networkTabState === 'step2invite' && (
        <Step2Invite
          wgOfferKey={wgOfferKeyForInvite}
          clipboardIsWorking={clipboardIsWorking}
          cancelConnection={cancelConnection}
          startEstablishingConnection={startEstablishingConnection}
        />
      )}
      {networkTabState === 'step3invite' && (
        <Step3Invite
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
    </>
  );
}
