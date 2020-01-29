const serializeWgConnection = c => {
  const { id, sender, receiver, state } = c;
  return {
    id,
    sender,
    receiver,
    state,
    //  connectionState: c.connection.connectionState,
  };
};

const serializeWgMesh = c => {
  const { sender, connectionsState } = c;
  return { sender, connectionsState };
};

const serializeWgOs = c => {
  const { user } = c;
  return { user };
};

export default (source, method, payload) => {
  console.log({ source, method, payload });
  //  //  return;
  /*
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
  }*/
};
