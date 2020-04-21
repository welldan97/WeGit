// Imports
// =============================================================================

const doFetch = fetch || require('node-fetch');

// Main
// =============================================================================

module.exports = ({ url }) => ({
  init: async wgOs => {
    const { wgOffer } = await wgOs.invite();
    const response = await doFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wgOffer }),
    });
    const { wgAnswer } = await response.json();
    await wgOs.establish(wgAnswer);
  },
});
