// Imports
// =============================================================================

const firebase = require('firebase');

// Utils
// =============================================================================

const cleanUndefined = value => JSON.parse(JSON.stringify(value));

const isAgent = wgOs => {
  return (
    [wgOs.currentUser.id, ...wgOs.users.map(u => u.id)].sort()[0] ===
    wgOs.currentUser.id
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
        if (!isAgent(wgOs)) return;
        if (value.wgOffer.sender === wgOs.currentUser.id) return;

        const { wgAnswer } = await wgOs.join(value.wgOffer);
        if (!wgAnswer) return;

        database.push(cleanUndefined({ wgAnswer }));
      } else if (value.wgAnswer) {
        if (value.wgAnswer.receiver !== wgOs.currentUser.id) return;

        await wgOs.establish(value.wgAnswer);
      }
    });

    database.once('value', () => {
      initialized = true;
      if (!wgOffer) return;

      database.push(cleanUndefined({ wgOffer }));
    });
  },
});
