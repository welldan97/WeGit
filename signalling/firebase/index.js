// Imports
// =============================================================================

const firebase = require('firebase');

// Utils
// =============================================================================

const cleanUndefined = value => JSON.parse(JSON.stringify(value));

const isAgent = wgOs => {
  return (
    [
      wgOs.currentUser.id,
      ...wgOs.getMeshState().connections.map(c => c.peer),
    ].sort()[0] === wgOs.currentUser.id
  );
};

// Main
// =============================================================================

module.exports = ({ room, firebaseConfig }) => ({
  init: async wgOs => {
    let initialized = false;
    const app = firebase.initializeApp(firebaseConfig);
    const database = firebase.database().ref(`rooms/${room}`);
    const { wgOffer } = await wgOs.invite();

    database.on('child_added', async data => {
      if (!initialized) return;
      const value = data.val();
      if (value.wgOffer) {
        if (value.wgOffer.sender === wgOs.currentUser.id) return;
        if (!isAgent(wgOs)) return;

        const { wgAnswer } = await wgOs.join(value.wgOffer);
        if (!wgAnswer) return;

        const date = new Date().toISOString();

        database.push(cleanUndefined({ wgAnswer, date }));
      } else if (value.wgAnswer) {
        if (value.wgAnswer.receiver !== wgOs.currentUser.id) return;

        await wgOs.establish(value.wgAnswer);
      }
    });

    database.once('value', snapshot => {
      initialized = true;
      if (!wgOffer) return;

      const entries = snapshot.val();
      Object.keys(entries).forEach(k => {
        const child = database.child(k);
        const TIMEOUT = 2 * 60 * 1000;
        if (new Date() - new Date(entries[k].date) > TIMEOUT) child.remove();
      });
      const date = new Date().toISOString();

      database.push(cleanUndefined({ wgOffer, date }));
    });
  },
});
