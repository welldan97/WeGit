// Imports
// =============================================================================

// Main
// =============================================================================

module.exports = ({ url }) => ({
  init: async wgOs => {
    const { wgOffer } = await wgOs.invite();
    const response = await fetch(url, {
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
