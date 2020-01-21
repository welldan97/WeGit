// Imports
// =============================================================================

const { fromWgKey } = require('./wgKey');
const WgMesh = require('./WgMesh');

// Main
// =============================================================================

module.exports = ({ EventTarget, Event, uuid, wrtc, log = () => {} }) =>
  class WgOs {
    [Symbol.toStringTag]() {}
    constructor({ user, config = {} }) {
      // class properties
      this.wgMesh = new (WgMesh({ EventTarget, Event, uuid, wrtc, log }))({
        config,
      });
      this.user = undefined;
      this.users = [];
      this.apps = [];
      this.eventTarget = new EventTarget();
      //  constructor
      this.user = { id: undefined, ...user };
      this.wgMesh.eventTarget.addEventListener('change', e =>
        this._onChange(e),
      );
      this.wgMesh.eventTarget.addEventListener('handshake', e =>
        this._onMeshHandshake(e),
      );
      this.wgMesh.eventTarget.addEventListener('message', e =>
        this._onMessage(e),
      );

      log('WgOs', 'constructor', {
        wgOs: this,
      });
    }

    _addUser(user) {
      if (this.users.find(u => u.id === user.id)) return;

      this.users = [...this.users, user];
    }

    _addApps(apps) {
      const appsToAdd = apps.filter(
        a => !this.apps.map(a => a.id).includes(a.id),
      );
      if (!appsToAdd.length) return;

      this.apps = [...this.apps, ...appsToAdd];

      this.eventTarget.dispatchEvent(new Event('change'));
    }

    getMeshState() {
      const connections = Object.entries(this.wgMesh.states).map(
        ([id, state]) => {
          const wgConnection = this.wgMesh.wgConnections.find(c => c.id === id);
          const user = this.users.find(u => u.id === wgConnection.receiver);
          return {
            userName: user && user.userName,
            id,
            state,
          };
        },
      );

      const getState = () => {
        if (connections.some(p => p.state === 'connected')) return 'connected';
        else if (connections.some(p => p.state === 'connecting'))
          return 'connecting';
        return 'disconnected';
      };

      return {
        connections,
        state: getState(),
      };
    }

    _onMeshHandshake(e) {
      log('WgOs', '_onMeshHandshake', {
        wgOs: this,
        message: event.data,
      });

      if (
        this.wgMesh.wgConnections.every(
          c => c.connection.connectionState === 'connected',
        )
      ) {
        // TODO: this should happen after handshake received
        this.eventTarget.dispatchEvent(new Event('ready'));
      }

      this.wgMesh.send(e.peer, {
        type: 'os:handshake',
        payload: {
          user: this.user,
          apps: this.apps,
        },
      });
    }

    _onHandshake(data) {
      this._addUser({ id: data.sender, ...data.payload.user });
      this._addApps(data.payload.apps);

      this.eventTarget.dispatchEvent(new Event('change'));
    }

    _onChange(e) {
      log('WgOs', 'change', {
        wgOs: this,
      });

      this.eventTarget.dispatchEvent(new Event('change'));
    }

    _onMessage(event) {
      const { type, payload } = event.data;

      log('WgOs', 'message', {
        wgOs: this,
        message: event.data,
      });

      switch (type) {
        case 'os:handshake':
          return this._onHandshake(event.data);
        case 'os:addApp':
          return this._onAddApp(event.data);

        default:
      }

      const messageEvent = new Event('message');
      messageEvent.data = { type, payload };

      this.eventTarget.dispatchEvent(messageEvent);
    }

    createApp(app) {
      const nextApp = {
        id: uuid(),
        name: undefined,
        description: undefined,
        ...app,
      };

      this._addApps([nextApp]);
      this.sendAll({
        type: 'os:addApp',
        payload: nextApp,
      });
    }

    _onAddApp(message) {
      this._addApps([message.payload]);
    }

    async create() {
      return await this.wgMesh.create({
        payload: { user: this.user },
      });
    }

    async join(wgOfferKey) {
      const {
        payload: { user },
        sender: id,
      } = fromWgKey(wgOfferKey);

      this._addUser({ id, ...user });
      return await this.wgMesh.join(wgOfferKey, {
        payload: { user: this.user },
      });
    }

    async establish(wgAnswerKey) {
      const {
        payload: { user },
        sender: id,
      } = fromWgKey(wgAnswerKey);

      this._addUser({ id, ...user });

      return await this.wgMesh.establish(wgAnswerKey);
    }

    closeConnection(wgConnectionId) {
      this.wgMesh.closeConnection(wgConnectionId);
    }

    send(peer, message) {
      this.wgMesh.send(peer, message);
    }

    sendAll(message) {
      this.wgMesh.sendAll(message);
    }
  };
