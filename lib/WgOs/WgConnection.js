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

const RTCSessionDescriptionToJSON = o => {
  const { sdp, type } = o;
  return { sdp, type };
};

// Main
// =============================================================================

module.exports = ({ EventTarget, Event, uuid, wrtc }) =>
  class WgConnection extends EventTarget {
    [Symbol.toStringTag]() {}
    constructor({ id, sender, receiver } = {}) {
      super();

      // class properties
      this.connection = new wrtc.RTCPeerConnection();
      this.id = undefined;
      this.sender = undefined;
      this.receiver = undefined;
      this.sendChannel = this.connection.createDataChannel('main');
      this.receiveChannel = undefined;

      //  constructor

      this.connection.addEventListener('datachannel', e => {
        this.receiveChannel = e.channel;

        // wgConnection ready state only here, once datachannels are ready
        this.dispatchEvent(new Event('change'));

        this.receiveChannel.addEventListener('message', e => {
          const event = new Event('message');
          event.data = JSON.parse(e.data);
          this.dispatchEvent(event);
        });
      });

      this.id = id || uuid();
      this.sender = sender;
      this.receiver = receiver;

      this.connection.addEventListener('connectionstatechange', e => {
        if (this.connection.connectionState === 'connected') return;
        this.dispatchEvent(new Event('change'));
      });
    }

    async _addCandidates(candidates) {
      await Promise.all(
        candidates.map(candidate => this.connection.addIceCandidate(candidate)),
      );
      console.log('candidates added');
      /*
    if (this.connection.iceConnectionState === 'connected') return;
    return new Promise((resolve, reject) => {
      this.connection.addEventListener('iceconnectionstatechange', e => {
        if (e.target.iceConnectionState === 'connected') resolve();
      });
    });*/
    }

    async _gatherCandidates() {
      return new Promise((resolve, reject) => {
        let candidates = [];

        this.connection.addEventListener('icecandidate', e => {
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

      return toWgKey('wgOffer')({
        id: this.id,
        sender: this.sender,
        receiver: this.receiver,

        offer: RTCSessionDescriptionToJSON(offer),
        candidates: candidates.map(serializeCandidate),
        payload,
      });
    }

    async join(wgOfferKey, { payload = {} } = {}) {
      const { offer, candidates: inCandidates } = fromWgKey(wgOfferKey);

      const [answer, candidates] = await Promise.all([
        this._createAnswer(offer, inCandidates),
        this._gatherCandidates(),
      ]);

      return toWgKey('wgAnswer')({
        id: this.id,
        sender: this.sender,
        receiver: this.receiver,

        answer: RTCSessionDescriptionToJSON(answer),
        candidates: candidates.map(serializeCandidate),
        payload,
      });
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
    }

    send(object) {
      this.sendChannel.send(
        JSON.stringify({ path: [], ...object, id: uuid(), version: VERSION }),
      );
    }
  };
