// Imports
// =============================================================================

const nanoid = require('nanoid');
const EventEmitter = require('eventemitter3');

const WgMesh = require('./WgMesh');

// Main
// =============================================================================

module.exports = class WgOs {
  [Symbol.toStringTag]() {}

  constructor({ currentUser = {}, apps = [], config = {}, log = () => {} }) {
    const id = nanoid();
    this.currentUser = { id, ...currentUser };
    this.users = [];
    //
    this.apps = apps;

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

  send(userId, message) {
    this._wgMesh.send(userId, message);
  }

  sendAll(message) {
    this._wgMesh.sendAll(message);
  }

  //### Events

  _onMessage({ message }) {
    const { type, payload } = message;

    switch (type) {
      case 'os:userSave':
        return this._onUserSave({ message });
      case 'os:appsSave':
        return this._onAppsSave({ message });

      default:
    }

    this._eventEmitter.emit('message', message);
  }

  // Apps
  //----------------------------------------------------------------------------

  _saveApps(apps) {
    const appsToAdd = apps.filter(
      a => !this.apps.map(a => a.id).includes(a.id),
    );
    if (!appsToAdd.length) return;

    this.apps = [...this.apps, ...appsToAdd];

    this._emit('apps:change');
  }

  saveApps(apps) {
    const nextApps = apps.map(app => ({
      id: nanoid(),
      name: '',
      description: '',
      icon: '',
      user: {
        userName: this.currentUser.userName,
      },
      ...app,
    }));

    this._saveApps(nextApps);

    this.sendAll({
      type: 'os:appsSave',
      payload: { apps: nextApps },
    });
  }

  deleteApp(appId) {
    this.apps = this.apps.filter(a => a.id !== appId);
    this._emit('apps:change');
  }

  //### Events

  _onAppsSave({ message }) {
    this._saveApps(message.payload.apps);
  }

  // Users
  //----------------------------------------------------------------------------

  _saveUser(user) {
    const userExists = this.users.find(u => u.id === user.id);
    if (userExists) {
      this.users = this.users.reduce((acc, u) => {
        return [...acc, u.id === user.id ? { ...u, ...user } : u];
      }, []);
    } else this.users = [...this.users, user];

    this._emit('users:change');
  }

  saveCurrentUser(user) {
    const { userName } = user;
    this.currentUser = { ...this.currentUser, userName };
    this.sendAll({
      type: 'os:userSave',
      payload: {
        user: this.currentUser,
      },
    });
  }

  //### Events

  _onUserSave({ message }) {
    const { payload } = message;
    this._saveUser(payload.user);
  }

  // Mesh
  //----------------------------------------------------------------------------

  async invite() {
    return await this._wgMesh.invite({
      payload: { user: this.currentUser },
    });
  }

  async join(wgOffer) {
    const {
      payload: { user },
    } = wgOffer;

    this._saveUser(user);

    return await this._wgMesh.join(wgOffer, {
      payload: { user: this.currentUser },
    });
  }

  async establish(wgAnswer) {
    const {
      payload: { user },
      sender: id,
    } = wgAnswer;

    this._saveUser(user);

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

  _onMeshHandshake({ wgConnection }) {
    this.send(wgConnection.receiver, {
      type: 'os:userSave',
      payload: {
        user: this.currentUser,
      },
    });

    this.send(wgConnection.receiver, {
      type: 'os:appsSave',
      payload: {
        apps: this.apps,
      },
    });
  }
};
