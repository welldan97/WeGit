// Imports
// =============================================================================

const EventEmitter = require('eventemitter3');

const WgConnection = require('./WgConnection');

// Main
// =============================================================================

module.exports = class WgMesh {
  [Symbol.toStringTag]() {}

  constructor({ sender, config = {}, log } = {}) {
    this.sender = sender;

    this._wgConnections = [];
    this._connectionsState = [];

    this._config = config;
    this._log = log;
    this._eventEmitter = new EventEmitter();

    this._onMessage = this._onMessage.bind(this);
    this._onConnect = this._onConnect.bind(this);
    this._onConnecting = this._onConnecting.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  // Getters
  //----------------------------------------------------------------------------

  getGlobalState() {
    if (this._connectionsState.some(s => s.state === 'connected'))
      return 'connected';
    if (this._connectionsState.some(s => s.state === 'connecting'))
      return 'connecting';

    return 'disconnected';
  }

  getConnectionsState() {
    return this._connectionsState.map(s => {
      const wgConnection = this._wgConnections.find(c => c.id === s.id);

      return {
        ...s,
        peer: wgConnection.receiver,
      };
    });
  }

  // EventEmitter
  //----------------------------------------------------------------------------

  on(eventName, listener) {
    this._eventEmitter.on(eventName, listener, this);
  }

  removeListener(eventName, listener) {
    this._eventEmitter.removeListener(eventName, listener);
  }

  _emit(eventName, args = {}) {
    this._eventEmitter.emit(eventName, { wgMesh: this, ...args });
  }

  // Messaging
  //----------------------------------------------------------------------------

  send(peer, { type, payload }) {
    const wgConnection = this._wgConnections.find(c => c.receiver === peer);
    wgConnection.send({
      type,
      receiver: wgConnection.receiver,
      payload,
    });
  }

  sendAll(message) {
    this._wgConnections
      .filter(c => c.state === 'connected')
      .forEach(c => this.send(c.receiver, message));
  }

  //### Events

  async _onPassMessage({ wgConnection, message }) {
    const finalReceiverWgConnection = this._wgConnections.find(
      o => o.receiver === message.receiver,
    );

    finalReceiverWgConnection.send({
      ...message,
      path: [...message.path, wgConnection.receiver],
    });
  }

  _onMessage({ wgConnection, message }) {
    const { type, receiver, payload } = message;

    // Pass messages to other senders
    if (receiver !== this.sender)
      return this._onPassMessage({ wgConnection, message });

    // Different message types
    switch (type) {
      case 'mesh:handshake':
        return this._onHandshake({ wgConnection, message });
      case 'mesh:offer':
        return this._onOffer({ wgConnection, message });
      case 'mesh:answer':
        return this._onAnswer({ wgConnection, message });
      default:
    }

    // Emit unprocessed messages
    this._emit('message', { wgConnection, message });
  }

  // Lifecycle
  //----------------------------------------------------------------------------

  _addConnection(wgConnection) {
    this._wgConnections = [...this._wgConnections, wgConnection];

    wgConnection.on('message', this._onMessage);
    wgConnection.on('connect', this._onConnect);
    wgConnection.on('connecting', this._onConnecting);
    wgConnection.on('close', this._onClose);

    this._connectionsState = [
      ...this._connectionsState,
      {
        id: wgConnection.id,
        state: wgConnection.state,
      },
    ];

    this._emit('change');
  }

  _removeConnection(wgConnection) {
    this._wgConnections = this._wgConnections.filter(
      e => e.id !== wgConnection.id,
    );

    this._connectionsState = this._connectionsState.filter(
      e => e.id !== wgConnection.id,
    );

    this._emit('change');
  }

  async invite({ receiver, payload = {} } = {}) {
    const wgConnection = new WgConnection({
      sender: this.sender,
      receiver,

      config: this._config,
      log: this._log,
    });

    this._addConnection(wgConnection);
    const wgOffer = await wgConnection.invite({ payload });

    return { wgConnection, wgOffer };
  }

  async join(wgOffer, { payload = {} } = {}) {
    const { id, sender: receiver } = wgOffer;
    const wgConnection = new WgConnection({
      id,
      sender: this.sender,
      receiver,

      config: this._config,
      log: this._log,
    });

    this._addConnection(wgConnection);
    const wgAnswer = await wgConnection.join(wgOffer, { payload });

    return { wgConnection, wgAnswer };
  }

  async establish(wgAnswer) {
    const { id } = wgAnswer;
    return await this._wgConnections.find(e => e.id === id).establish(wgAnswer);
  }

  close(wgConnectionId) {
    const wgConnection = this._wgConnections.find(e => e.id === wgConnectionId);

    return wgConnection.close();
  }

  //### Events

  _onConnecting({ wgConnection }) {
    console.log(this);
    this._connectionsState = this._connectionsState.reduce(
      (acc, s) => [
        ...acc,
        s.id === wgConnection.id ? { ...s, state: 'connecting' } : s,
      ],
      [],
    );
    console.log(this._connectionsState);
    this._emit('change');
  }

  _onClose({ wgConnection }) {
    this._removeConnection(wgConnection);
  }

  // Handshake
  //----------------------------------------------------------------------------

  //### 1. Connect, send Handshake

  _onConnect({ wgConnection }) {
    // initiate handshake
    this.send(wgConnection.receiver, {
      type: 'mesh:handshake',
      payload: {
        peerIds: this._wgConnections
          .filter(e => e.id !== wgConnection.id)
          .map(e => e.receiver),
      },
    });
  }

  //### 2. Receive Handshake, send offers

  async _onHandshake({ wgConnection, message }) {
    const { peerIds } = message.payload;

    const newPeerIds = peerIds.filter(
      id => !this._wgConnections.map(o => o.receiver).includes(id),
    );
    const createdConnectionsAndOffers = await Promise.all(
      newPeerIds.map(id => this.invite({ receiver: id })),
    );

    createdConnectionsAndOffers.forEach(
      ({ wgConnection: finalReceiverWgConnection, wgOffer }) => {
        wgConnection.send({
          receiver: finalReceiverWgConnection.receiver,
          type: 'mesh:offer',
          payload: {
            wgOffer,
          },
        });
      },
    );

    this._connectionsState = this._connectionsState.reduce(
      (acc, s) => [
        ...acc,
        s.id === wgConnection.id ? { ...s, state: 'connected' } : s,
      ],
      [],
    );

    this._emit('change');
    this._emit('handshake', { wgConnection });
  }

  //### 3. Receive offers, send answers

  async _onOffer({ wgConnection, message }) {
    const { path } = message;
    const { wgOffer } = message.payload;
    const { wgAnswer } = await this.join(wgOffer);

    wgConnection.send({
      receiver: path[0],
      type: 'mesh:answer',
      payload: {
        wgAnswer,
      },
    });
  }

  //### 4. Receive answers, establish connections

  async _onAnswer({ wgConnection, message }) {
    const { path } = message;
    const { wgAnswer } = message.payload;

    return await this.establish(wgAnswer);
  }
};
