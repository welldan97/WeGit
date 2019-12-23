// Imports
// =============================================================================

const { fromWgKey } = require('./wgKey');
const WgMesh = require('./WgMesh');

// Main
// =============================================================================

module.exports = ({ EventTarget, Event, uuid, wrtc }) =>
  class WgAppStore extends EventTarget {
    [Symbol.toStringTag]() {}
    constructor({ user }) {
      super();
      // class properties
      this.wgMesh = new (WgMesh({ EventTarget, Event, uuid, wrtc }))();
      this.user = undefined;
      this.users = [];
      this.apps = [];

      //  constructor
      this.user = { id: undefined, ...user };
      this.wgMesh.addEventListener('change', e => this._onChange(e));
      this.wgMesh.addEventListener('handshake', e => this._onMeshHandshake(e));
      this.wgMesh.addEventListener('message', e => this._onMessage(e));
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

      this.dispatchEvent(new Event('change'));
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

    getMeshState() {
      return this.wgMesh.wgConnections.map(c => {
        const user = this.users.find(u => u.id === c.receiver);
        return {
          userName: user && user.userName,
          connectionState: c.connection.connectionState,
        };
      });
    }

    _onMeshHandshake(e) {
      if (
        this.wgMesh.wgConnections.every(
          c => c.connection.connectionState === 'connected',
        )
      ) {
        // TODO: this should happen after handshake received
        this.dispatchEvent(new Event('ready'));
      }

      this.wgMesh.send(e.peer, {
        type: 'appstore:handshake',
        payload: {
          user: this.user,
          apps: this.apps,
        },
      });
    }

    _onHandshake(data) {
      this._addUser({ id: data.sender, ...data.payload.user });
      this._addApps(data.payload.apps);

      this.dispatchEvent(new Event('change'));
    }

    _onChange(e) {
      this.dispatchEvent(new Event('change'));
    }

    _onMessage(event) {
      const { type, payload } = event.data;

      switch (type) {
        case 'appstore:handshake':
          return this._onHandshake(event.data);
        case 'appstore:addApp':
          return this._onAddApp(event.data);

        default:
      }

      const messageEvent = new Event('message');
      messageEvent.data = { type, payload };

      this.dispatchEvent(messageEvent);
    }

    send(peer, message) {
      this.wgMesh.send(peer, message);
    }

    sendAll(message) {
      this.wgMesh.sendAll(message);
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
        type: 'appstore:addApp',
        payload: nextApp,
      });
    }

    _onAddApp(message) {
      this._addApps([message.payload]);
    }
  };
