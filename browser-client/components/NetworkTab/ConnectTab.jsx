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

const getProgress = ({
  networkTabState,
  wgOfferKeyForInvite,
  wgAnswerKeyForJoin,
}) => {
  switch (networkTabState) {
    case 'step1':
      return 0;
    case 'step2invite':
      if (!wgOfferKeyForInvite) return 25;
      return 50;
    case 'step2join':
      return 25;
    case 'step3invite':
    case 'step3join':
      if (!wgAnswerKeyForJoin) return 50;
      return 75;
    default:
  }
};

// Main
// =============================================================================

export default function ConnectTab({
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
}) {
  return (
    <>
      <Progressbar
        progress={getProgress({
          networkTabState,
          wgOfferKeyForInvite,
          wgAnswerKeyForJoin,
        })}
      />
      {networkTabState === 'step1' && (
        <Step1
          networkAlert={networkAlert}
          meshState={meshState}
          invite={invite}
          startJoining={startJoining}
        />
      )}
      {networkTabState === 'step2invite' && (
        <Step2Invite
          clipboardIsWorking={clipboardIsWorking}
          wgOfferKey={wgOfferKeyForInvite}
          cancelConnection={cancelConnection}
          startEstablishing={startEstablishing}
        />
      )}
      {networkTabState === 'step3invite' && (
        <Step3Invite
          peerIsConnecting={peerIsConnecting}
          establish={establish}
          cancelConnection={cancelConnection}
        />
      )}
      {networkTabState === 'step2join' && (
        <Step2Join join={join} cancelConnection={cancelConnection} />
      )}
      {networkTabState === 'step3join' && (
        <Step3Join
          clipboardIsWorking={clipboardIsWorking}
          wgAnswerKey={wgAnswerKeyForJoin}
          cancelConnection={cancelConnection}
        />
      )}
    </>
  );
}
