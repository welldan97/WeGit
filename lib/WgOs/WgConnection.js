// Imports
// =============================================================================

const { fromWgKey, toWgKey } = require('./wgKey');
const VERSION = require('../version');

// Helpers
// =============================================================================

const serializeCandidate = candidate => ({
  sdpMLineIndex: candidate.sdpMLineIndex,
  candidate: candidate.candidate,
});

const serializeRTCSessionDescription = o => {
  const { sdp, type } = o;
  return { sdp, type };
};

// Main
// =============================================================================

module.exports = ({ EventTarget, Event, uuid, wrtc, log }) =>
  class WgConnection {
    [Symbol.toStringTag]() {}

    constructor({ id, sender, receiver, config = {} } = {}) {
      const passedConfig = { iceServers: config.iceServers };
      // class properties
      this.connection = new wrtc.RTCPeerConnection(passedConfig);
      this.id = undefined;
      this.sender = undefined;
      this.receiver = undefined;
      this.sendChannel = this.connection.createDataChannel('main');
      this.receiveChannel = undefined;
      this.state = 'new';
      this.eventTarget = new EventTarget();

      //  constructor

      this.connection.addEventListener('datachannel', e => {
        log('WgConnection', 'datachannel', {
          wgConnection: this,
        });

        this.receiveChannel = e.channel;

        this.receiveChannel.addEventListener('message', e => {
          const event = new Event('message');
          event.data = JSON.parse(e.data);

          log('WgConnection', 'message', {
            wgConnection: this,
            message: event.data,
          });

          this.eventTarget.dispatchEvent(event);
        });

        // wgConnection ready state only here, once datachannels are ready
        this.state = this.connection.connectionState;

        this.eventTarget.dispatchEvent(new Event('change'));
      });

      this.id = id || uuid();
      this.sender = sender;
      this.receiver = receiver;

      this.connection.addEventListener('connectionstatechange', e => {
        log('WgConnection', 'change', {
          wgConnection: this,
        });

        if (this.connection.connectionState === 'connected') return;
        this.state = this.connection.connectionState;

        this.eventTarget.dispatchEvent(new Event('change'));
      });

      log('WgConnection', 'constructor', {
        wgConnection: this,
      });
    }

    deconstructor() {
      // TODO
    }

    async _addCandidates(candidates) {
      await Promise.all(
        candidates.map(candidate => this.connection.addIceCandidate(candidate)),
      );
    }

    async _gatherCandidates() {
      return new Promise((resolve, reject) => {
        let candidates = [];

        this.connection.addEventListener('icecandidate', e => {
          console.log(e && e.candidate && e.candidate.candidate);
          if (!e.candidate) resolve(candidates);
          else candidates.push(e.candidate);
        });
      });
    }

    async _createOffer() {
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      return offer;
    }

    async _createAnswer(offer, candidates) {
      await this.connection.setRemoteDescription(
        new wrtc.RTCSessionDescription(offer),
      );
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);
      await this._addCandidates(candidates);
      return answer;
    }

    async create({ payload = {} } = {}) {
      const [offer, candidates] = await Promise.all([
        this._createOffer(),
        this._gatherCandidates(),
      ]);

      const wgOffer = {
        id: this.id,
        sender: this.sender,
        receiver: this.receiver,

        offer: serializeRTCSessionDescription(offer),
        candidates: candidates.map(serializeCandidate),
        payload,
      };

      log('WgConnection', 'create', {
        wgConnection: this,
        wgOffer,
      });

      return toWgKey('wgOffer')(wgOffer);
    }

    async join(wgOfferKey, { payload = {} } = {}) {
      const { offer, candidates: inCandidates } = fromWgKey(wgOfferKey);

      const [answer, candidates] = await Promise.all([
        this._createAnswer(offer, inCandidates),
        this._gatherCandidates(),
      ]);

      const wgAnswer = {
        id: this.id,
        sender: this.sender,
        receiver: this.receiver,

        answer: serializeRTCSessionDescription(answer),
        candidates: candidates.map(serializeCandidate),
        payload,
      };

      log('WgConnection', 'join', {
        wgConnection: this,
        wgAnswer,
        wgOffer: fromWgKey(wgOfferKey),
      });

      return toWgKey('wgAnswer')(wgAnswer);
    }

    async establish(wgAnswerKey) {
      const { answer, candidates: inCandidates, sender } = fromWgKey(
        wgAnswerKey,
      );
      this.receiver = sender;
      await this.connection.setRemoteDescription(
        new wrtc.RTCSessionDescription(answer),
      );
      await this._addCandidates(inCandidates);

      log('WgConnection', 'establish', {
        wgConnection: this,
        wgAnswer: fromWgKey(wgAnswerKey),
      });
    }

    close() {
      log('WgConnection', 'close', {
        wgConnection: this,
      });
      this.connection.close();

      this.state = this.connection.connectionState;
      this.eventTarget.dispatchEvent(new Event('change'));
    }

    send(object) {
      const message = { path: [], ...object, id: uuid(), version: VERSION };

      log('WgConnection', 'send', {
        wgConnection: this,
        message,
      });

      this.sendChannel.send(
        JSON.stringify({ path: [], ...object, id: uuid(), version: VERSION }),
      );
    }
  };
