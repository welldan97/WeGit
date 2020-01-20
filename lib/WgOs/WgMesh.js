// Imports
// =============================================================================

const { fromWgKey } = require('./wgKey');
const WgConnection = require('./WgConnection');

// Helpers
// =============================================================================

// Promise equivalent of setImmediate
/*const doImmediate = async fn =>
  new Promise(resolve => setTimeout(() => resolve(fn())));
*/

// Main
// =============================================================================

module.exports = ({ EventTarget, Event, uuid, wrtc, log }) =>
  class WgMesh extends EventTarget {
    [Symbol.toStringTag]() {}
    constructor({ config = {} } = {}) {
      super();
      // class properties
      this.config = config;
      this.wgConnections = [];
      this.sender = uuid();
      this.states = {};

      //  constructor

      log('WgMesh', 'constructor', {
        wgMesh: this,
      });
    }

    async _onPassMessage(wgConnection, data) {
      const finalReceiverWgConnection = this.wgConnections.find(
        o => o.receiver === data.receiver,
      );
      finalReceiverWgConnection.send({
        ...data,
        path: [...data.path, wgConnection.receiver],
      });
    }

    async _onHandshake(wgConnection, { payload: { peerIds } }) {
      const newPeerIds = peerIds.filter(
        id => !this.wgConnections.map(o => o.receiver).includes(id),
      );
      const created = await Promise.all(
        newPeerIds.map(id => this.create({ receiver: id })),
      );

      created.forEach(
        ({ wgConnection: finalReceiverWgConnection, wgOfferKey }) => {
          wgConnection.send({
            receiver: finalReceiverWgConnection.receiver,
            type: 'mesh:offer',
            payload: {
              wgOfferKey,
            },
          });
        },
      );

      this.states[wgConnection.id] = 'connected';
      this.dispatchEvent(new Event('change'));

      const event = new Event('handshake');
      event.peer = wgConnection.receiver;
      this.dispatchEvent(event);
    }

    async _onOffer(wgConnection, { path, payload: { wgOfferKey } }) {
      const { wgAnswerKey } = await this.join(wgOfferKey);

      wgConnection.send({
        receiver: path[0],
        type: 'mesh:answer',
        payload: {
          wgAnswerKey,
        },
      });
    }

    async _onAnswer(wgConnection, { path, payload: { wgAnswerKey } }) {
      this.establish(wgAnswerKey);
    }

    _onMessage(event) {
      const { type, receiver, payload } = event.data;
      const nextData = { ...event.data, sender: event.target.receiver };

      log('WgMesh', 'message', {
        wgMesh: this,
        message: event.data,
      });

      if (receiver !== this.sender)
        return this._onPassMessage(event.target, event.data);

      switch (type) {
        case 'mesh:handshake':
          return this._onHandshake(event.target, event.data);
        case 'mesh:offer':
          return this._onOffer(event.target, event.data);
        case 'mesh:answer':
          return this._onAnswer(event.target, event.data);
        default:
      }

      const messageEvent = new Event('message');
      messageEvent.data = nextData;

      this.dispatchEvent(messageEvent);
    }

    _handshake(wgConnection) {
      this.send(wgConnection.receiver, {
        type: 'mesh:handshake',
        payload: {
          peerIds: this.wgConnections
            .filter(e => e.id !== wgConnection.id)
            .map(e => e.receiver),
        },
      });
    }

    _onChange(event) {
      const wgConnection = event.target;

      log('WgMesh', '_onChange', {
        wgMesh: this,
        wgConnection: wgConnection,
      });
      switch (wgConnection.state) {
        case 'new':
        case 'connecting': {
          this.states[wgConnection.id] = wgConnection.state;
          this.dispatchEvent(new Event('change'));
          break;
        }
        case 'connected': {
          this._handshake(wgConnection);
          break;
        }
        case 'disconnected':
        case 'failed':
        case 'closed': {
          this._removeConnection(wgConnection);
          break;
        }
        default:
      }

      //this._updateState();

      //this.dispatchEvent(new Event('change'));
    }
    /*
    _updateState() {
      log('WgMesh', '_updateState', {
        wgMesh: this,
      });
      const prevConnectionsState = this.states;
      this.states = this.wgConnections.reduce(
        (acc, c) => ({ ...acc, [c.id]: c.state }),
        {},
      );
      // Simple states equality check
      if (
        Object.entries(this.states)
          .flat()
          .some((v, i) => Object.entries(prevConnectionsState).flat()[i] !== v)
      )
        this.dispatchEvent(new Event('change'));
    }
*/
    _addConnection(wgConnection) {
      log('WgMesh', '_addConnection', {
        wgMesh: this,
        wgConnection: wgConnection,
      });

      this.wgConnections = [...this.wgConnections, wgConnection];

      wgConnection.addEventListener('message', e => this._onMessage(e));
      wgConnection.addEventListener('change', e => this._onChange(e));

      this.states[wgConnection.id] = wgConnection.state;
      this.dispatchEvent(new Event('change'));
    }

    _removeConnection(wgConnection) {
      this.wgConnections = this.wgConnections.filter(
        e => e.id !== wgConnection.id,
      );
      delete this.states[wgConnection.id];
      this.dispatchEvent(new Event('change'));
    }

    closeConnection(wgConnectionId) {
      const wgConnection = this.wgConnections.find(
        e => e.id === wgConnectionId,
      );

      log('WgMesh', 'closeConnection', {
        wgMesh: this,
        wgConnection: wgConnection,
      });
      wgConnection.close();
    }

    async create({ receiver, payload = {} } = {}) {
      const wgConnection = new (WgConnection({
        Event,
        EventTarget,
        uuid,
        wrtc,
        log,
      }))({
        config: this.config,
        receiver,
        sender: this.sender,
      });
      this._addConnection(wgConnection);
      const wgOfferKey = await wgConnection.create({ payload });
      return { wgConnection, wgOfferKey };
    }

    async join(wgOfferKey, { payload = {} } = {}) {
      const { id, sender: receiver } = fromWgKey(wgOfferKey);
      const wgConnection = new (WgConnection({
        Event,
        EventTarget,
        uuid,
        wrtc,
        log,
      }))({
        id,
        config: this.config,
        receiver,
        sender: this.sender,
      });
      this._addConnection(wgConnection);

      const wgAnswerKey = await wgConnection.join(wgOfferKey, { payload });

      return { wgConnection, wgAnswerKey };
    }

    async establish(wgAnswerKey) {
      const { id } = fromWgKey(wgAnswerKey);
      await this.wgConnections.find(e => e.id === id).establish(wgAnswerKey);
    }

    send(peer, { type, payload }) {
      const wgConnection = this.wgConnections.find(c => c.receiver === peer);
      wgConnection.send({
        type,
        receiver: wgConnection.receiver,
        payload,
      });
    }

    sendAll(message) {
      this.wgConnections
        .filter(c => c.connection.connectionState === 'connected')
        .forEach(wgConnection => this.send(wgConnection.receiver, message));
    }
  };
