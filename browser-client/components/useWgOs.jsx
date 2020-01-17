// Imports
// =============================================================================

import { useEffect, useRef, useState } from '../lib/shims/React';
import WgOs from 'wegit-lib/WgOs';
import 'wegit-lib/browser/bootstrap.min.css';

import uuid from '../lib/uuid';

// Main
// =============================================================================

const userName = Math.random()
  .toString(36)
  .substring(7);

const user = { userName };

// For logging
const serializeWgConnection = c => {
  const { id, sender, receiver, state } = c;
  return { id, sender, receiver, state, connectionState: c.state };
};

const serializeWgMesh = c => {
  const { sender, connectionsState } = c;
  return { sender, connectionsState };
};

const serializeWgOs = c => {
  const { user } = c;
  return { user };
};

const log = (source, method, payload) => {
  if (source === 'WgConnection') {
    const { wgConnection, ...rest } = payload;
    const header = [
      `⚪️ %c${source}%c#${method}` +
        (method === 'send' || method === 'message'
          ? ` ${rest.message.type}`
          : '') +
        `\n%c${wgConnection.receiver}:` +
        `${wgConnection.state}`,
      'color: #000',
      'color: #555',
      'color: #777',
    ];
    console.groupCollapsed(...header);
    console.log(wgConnection);
    console.log(
      JSON.stringify(
        { wgConnection: serializeWgConnection(wgConnection), ...rest },
        undefined,
        2,
      ),
    );
    console.groupEnd();
  } else if (source === 'WgMesh') {
    const { wgMesh, wgConnection, ...rest } = payload;
    const header = [
      `🔷 %c${source}%c#${method}\n%c` +
        Object.entries(wgMesh.states)
          .map(
            ([id, v]) =>
              `${wgMesh.wgConnections.find(c => c.id === id).receiver}:${v}`,
          )
          .join('\n'),
      'color: #000',
      'color: #555',
      'color: #777',
    ];
    console.groupCollapsed(...header);
    console.log(wgMesh);

    console.log(
      JSON.stringify(
        {
          wgMesh: serializeWgMesh(wgMesh),
          ...(wgConnection
            ? { wgConnection: serializeWgConnection(wgConnection) }
            : {}),
          ...rest,
        },
        undefined,
        2,
      ),
    );
    console.groupEnd();
  } else if (source === 'WgOs') {
    const { wgOs, ...rest } = payload;
    const header = [
      `⬛️ %c${source}%c#${method}\n%c` +
        Object.entries(wgOs.wgMesh.states)
          .map(
            ([id, v]) =>
              `${
                wgOs.wgMesh.wgConnections.find(c => c.id === id).receiver
              }:${v}`,
          )
          .join('\n'),
      'color: #000',
      'color: #555',
      'color: #777',
    ];
    console.groupCollapsed(...header);
    console.log({ wgOs: serializeWgOs(wgOs), ...rest });
    console.log(JSON.stringify({}, undefined, 2));
    console.groupEnd();
  }
};
export default function useWgOs() {
  const [wgOfferKeyForCreate, setWgOfferKeyForCreate] = useState('');
  const [wgAnswerKeyForJoin, setWgAnswerKeyForJoin] = useState('');
  const wgOsRef = useRef(null);
  useEffect(() => {
    if (wgOsRef.current !== null) return;
    const wrtc = { RTCPeerConnection, RTCSessionDescription };
    wgOsRef.current = new (WgOs({
      Event,
      EventTarget,
      uuid,
      wrtc,
      log,
    }))({
      user,
    });
    window.wgOs = wgOsRef.current;
  });
  const createConnection = async () => {
    const { wgOfferKey } = await wgOsRef.current.create();
    setWgOfferKeyForCreate(wgOfferKey);
    await navigator.clipboard.writeText(wgOfferKey);
  };
  const joinConnection = async wgOfferKey => {
    const { wgAnswerKey } = await wgOsRef.current.join(wgOfferKey);
    setWgAnswerKeyForJoin(wgAnswerKey);
    navigator.clipboard.writeText(wgAnswerKey);
  };
  const establishConnection = async wgAnswerKey => {
    wgOsRef.current.establish(wgAnswerKey);
  };
  return {
    wgOfferKeyForCreate,
    wgAnswerKeyForJoin,
    createConnection,
    joinConnection,
    establishConnection,
  };
}
