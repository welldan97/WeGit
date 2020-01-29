// Imports
// =============================================================================

const WgMesh = require('./WgMesh');
const EventEmitter = require('eventemitter3');
const nanoid = require('nanoid');

// Main
// =============================================================================

module.exports = class WgOs {
  [Symbol.toStringTag]() {}

  constructor({ user, config = {}, log = () => {} }) {
    const id = nanoid();
    this.user = { id, ...user };
    this.users = [];
    this.apps = [];

    this._wgMesh = new WgMesh({
      sender: id,
      config,
      log,
    });

    this._eventEmitter = new EventEmitter();

    this._onMessage = this._onMessage.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onMeshHandshake = this._onMeshHandshake.bind(this);

    this._wgMesh.on('message', this._onMessage);
    this._wgMesh.on('change', this._onChange);
    this._wgMesh.on('handshake', this._onMeshHandshake);
  }

  // Getters
  //----------------------------------------------------------------------------

  getMeshState() {
    const connections = this._wgMesh.getConnectionsState();
    return {
      connections,
      globalState: this._wgMesh.getGlobalState(),
    };
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
    this._eventEmitter.emit(eventName, { wgOs: this, ...args });
  }

  // Messaging
  //----------------------------------------------------------------------------

  send(peer, message) {
    this._wgMesh.send(peer, message);
  }

  sendAll(message) {
    this._wgMesh.sendAll(message);
  }

  //### Events

  _onMessage({ message }) {
    const { type, payload } = message;

    switch (type) {
      case 'os:handshake':
        return this._onOsHandshake({ message });
      case 'os:addApp':
        return this._onAddApp({ message });

      default:
    }

    this._eventEmitter.emit('message', message);
  }

  // Apps
  //----------------------------------------------------------------------------
  /*
  _addApps(apps) {
    const appsToAdd = apps.filter(
      a => !this.apps.map(a => a.id).includes(a.id),
    );
    if (!appsToAdd.length) return;

    this.apps = [...this.apps, ...appsToAdd];

    this.eventTarget.dispatchEvent(new Event('change'));
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
*/
  // Users
  //----------------------------------------------------------------------------

  _saveUser(user) {
    const userExists = this.users.find(u => u.id === user.id);
    if (userExists) {
      this.users.reduce((acc, u) => {
        return [...acc, u.id === user.id ? { ...u, ...user } : u];
      }, []);
    } else this.users = [...this.users, user];

    this._emit('users:change');
  }

  // Mesh
  //----------------------------------------------------------------------------

  async invite() {
    return await this._wgMesh.invite({
      payload: { user: this.user },
    });
  }

  async join(wgOffer) {
    const {
      payload: { user },
      sender: id,
    } = wgOffer;

    this._saveUser({ id, ...user });

    return await this._wgMesh.join(wgOffer, {
      payload: { user: this.user },
    });
  }

  async establish(wgAnswer) {
    const {
      payload: { user },
      sender: id,
    } = wgAnswer;

    this._saveUser({ id, ...user });

    return await this._wgMesh.establish(wgAnswer);
  }

  close(wgConnectionId) {
    return this._wgMesh.close(wgConnectionId);
  }

  //### Events

  _onChange() {
    this._emit('mesh:change');
  }

  // Handshake
  //----------------------------------------------------------------------------

  //### 1. After mesh handshake - initiate OS handshake

  _onMeshHandshake({ wgConnection }) {
    this._wgMesh.send(wgConnection.receiver, {
      type: 'os:handshake',
      payload: {
        user: this.user,
        apps: this.apps,
      },
    });
  }

  //### 2. Receive OS handshake

  _onOsHandshake({ message }) {
    const { payload } = message;

    this._saveUser(payload.user);
    //this._addApps(payload.apps);
  }
};
