// Imports
// =============================================================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const WgOs = require('wegit-lib/WgOs');

// Main
// =============================================================================

const config = JSON.parse(process.env.WG_CONFIG || '{}');
const currentUser = {
  userName: 'HTTPS Signalling Server',
  type: 'signalling',
};
const apps = [];

let wgOs;

const reset = () => {
  if (wgOs) wgOs.disconnnect();
  wgOs = new WgOs({
    config,
    currentUser,
    apps,
  });
};

reset();

const app = express();
const port = process.env.PORT || 1993;
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('It works!'));
app.get('/state', (req, res) => {
  const baseMeshState = wgOs.getMeshState();
  const meshState = {
    connections: baseMeshState.connections.map(c => ({
      ...c,
      user: wgOs.users.find(u => u.id === c.peer),
    })),
    globalState: baseMeshState.globalState,
  };

  res.send(`<pre>${JSON.stringify(meshState, undefined, 2)}</pre>`);
});

app.delete('/', (req, res) => reset());

app.post('/', async (req, res) => {
  const { wgOffer } = req.body;
  const { wgAnswer } = await wgOs.join(wgOffer);
  if (wgAnswer) return res.json({ wgAnswer });
  res.status(409);
  res.send();
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
