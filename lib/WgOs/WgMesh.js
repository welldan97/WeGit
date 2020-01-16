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

module.exports = ({ EventTarget, Event, uuid, wrtc }) =>
  class WgMesh extends EventTarget {
    [Symbol.toStringTag]() {}
    constructor() {
      super();
      // class properties
      this.wgConnections = [];
      this.sender = uuid();

      //  constructor
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

    _handshake(wgConnection) {
      wgConnection.send({
        type: 'mesh:handshake',
        receiver: wgConnection.receiver,
        payload: {
          peerIds: this.wgConnections
            .filter(e => e.id !== wgConnection.id)
            .map(e => e.receiver),
        },
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
      console.log('MESSAGE:', nextData);

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

    _addConnection(wgConnection) {
      this.wgConnections = [...this.wgConnections, wgConnection];

      wgConnection.addEventListener('change', e => this._onChange(e));
      wgConnection.addEventListener('message', e => this._onMessage(e));
      wgConnection.dispatchEvent(new Event('change'));
    }

    _removeConnection(wgConnection) {
      this.wgConnections = this.wgConnections.filter(
        e => e.id !== wgConnection.id,
      );
      wgConnection.removeEventListener('change', this._onChange);
    }

    async create({ receiver, payload = {} } = {}) {
      const wgConnection = new (WgConnection({
        Event,
        EventTarget,
        uuid,
        wrtc,
      }))({
        receiver,
        sender: this.sender,
      });
      this._addConnection(wgConnection);
      const wgOfferKey = await wgConnection.create({ payload });
      return { wgConnection, wgOfferKey };
    }

    async join(wgOfferKey, { payload = {} } = {}) {
      const { id, sender: receiver } = fromWgKey(wgOfferKey);
      console.log(id);
      const wgConnection = new (WgConnection({
        Event,
        EventTarget,
        uuid,
        wrtc,
      }))({
        id,
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

    _onChange(event) {
      const wgConnection = event.target;
      const { connection } = wgConnection;
      const { connectionState } = connection;

      switch (connectionState) {
        case 'connected':
          this._handshake(wgConnection);
          break;
        case 'disconnected':
        case 'failed':
          connection.close();
          this._removeConnection(wgConnection);
          break;
        case 'closed':
          this._removeConnection(wgConnection);
          break;
        default:
      }
      this.dispatchEvent(new Event('change'));
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
