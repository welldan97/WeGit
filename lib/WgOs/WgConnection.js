// Imports
// =============================================================================

const Peer = require('simple-peer');
const EventEmitter = require('eventemitter3');
const nanoid = require('nanoid');

const VERSION = require('../version');

// Helpers
// =============================================================================

let wrtcOptions = {};
if (typeof window === 'undefined') {
  const wrtc = require('wrtc');
  wrtcOptions = { wrtc };
}

// Monkeypatching connection to add 'connecting' event listener
const addOnConnecting = (peer, listener) => {
  const passedListener = () => {
    if (!peer || !peer._pc) return;
    if (peer._pc.connectionState !== 'connecting') return;

    listener();
  };

  peer._pc.addEventListener('connectionstatechange', passedListener);

  return () => {
    if (!peer || !peer._pc) return;
    peer._pc.removeEventListener('connectionstatechange', passedListener);
  };
};

const serializeRTCSessionDescription = o => {
  const { sdp, type } = o;
  return { sdp, type };
};

// Main
// =============================================================================

module.exports = class WgConnection {
  [Symbol.toStringTag]() {}

  constructor({ id, sender, receiver, config = {}, log } = {}) {
    this.id = id || nanoid();
    this.sender = sender;
    this.receiver = receiver;
    this.state = 'new';

    this._config = { iceServers: config.iceServers };
    this._log = ((method, payload) =>
      log('WgConnection', method, { wgConnection: this, ...payload })).bind(
      this,
    );
    this._eventEmitter = new EventEmitter();

    this._onConnect = this._onConnect.bind(this);
    this._onConnecting = this._onConnecting.bind(this);
    this._onClose = this._onClose.bind(this);
    this._onError = this._onError.bind(this);
    this._onMessage = this._onMessage.bind(this);
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
    this._eventEmitter.emit(eventName, { wgConnection: this, ...args });
  }

  // Messaging
  //----------------------------------------------------------------------------

  send(message) {
    const finalMessage = {
      path: [],
      ...message,
      id: nanoid(),
      version: VERSION,
    };

    this._log('send', { message: finalMessage });

    this.peer.send(JSON.stringify(finalMessage));
  }

  //### Events

  _onMessage(data) {
    if (this.state === 'closed') return;

    const rawMessage = JSON.parse(data);
    const message = {
      ...rawMessage,
      path: [...rawMessage.path, this.receiver],
    };
    this._log('_onMessage', {
      message,
    });

    this._emit('message', { message });
  }

  // Lifecycle
  //----------------------------------------------------------------------------

  async _createPeer({ offer = undefined } = {}) {
    return await new Promise(resolve => {
      let resolved = false;
      this.peer = new Peer({
        ...wrtcOptions,
        initiator: !offer,
        trickle: false,
        config: this._config,
      });

      this.peer.on('signal', (...args) => {
        if (resolved) return;
        resolved = true;
        resolve(...args);
      });
      this.peer.on('connect', this._onConnect);
      this.removeOnConnecting = addOnConnecting(this.peer, this._onConnecting);
      this.peer.on('close', this._onClose);
      this.peer.on('error', this._onError);

      this.peer.on('data', this._onMessage);

      if (offer) this.peer.signal(offer);
    });
  }

  async invite({ payload = {} } = {}) {
    const offer = await this._createPeer();

    const wgOffer = {
      id: this.id,
      sender: this.sender,
      receiver: this.receiver,

      offer: serializeRTCSessionDescription(offer),
      payload,
    };

    this._log('invite', { wgOffer });

    return wgOffer;
  }

  async join(wgOffer, { payload = {} } = {}) {
    const { offer } = wgOffer;
    const answer = await this._createPeer({ offer });

    const wgAnswer = {
      id: this.id,
      sender: this.sender,
      receiver: this.receiver,

      answer: serializeRTCSessionDescription(answer),
      payload,
    };

    this._log('join', { wgOffer, wgAnswer });

    return wgAnswer;
  }

  async establish(wgAnswer) {
    const { answer, sender } = wgAnswer;
    this.receiver = sender;
    this.peer.signal(answer);

    this._log('establish', { wgAnswer });
  }

  close() {
    if (this.state === 'closed') return;

    this.state = 'closed';
    this.removeOnConnecting();
    this.peer.destroy();
    this._log('close');

    this._emit('close');
  }

  //### Events

  _onConnect() {
    if (this.state === 'closed') return;

    this.state = 'connected';

    this._log('_onConnect');

    this._emit('connect');
  }

  _onConnecting() {
    if (this.state === 'closed') return;

    this.state = 'connecting';

    this._log('_onConnecting');

    this._emit('connecting');
  }

  _onClose() {
    if (this.state === 'closed') return;

    this._log('_onClose');

    this.close();
  }

  _onError(error) {
    if (this.state === 'closed') return;

    // NOTE: after that onClose is called automatically
    this._log('_onError', { error });
  }
};
