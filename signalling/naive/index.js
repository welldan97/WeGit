// Imports
// =============================================================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const WgOs = require('wegit-lib/WgOs');
const { toWgKey, fromWgKey } = require('wegit-lib/utils/wgKey');

// Main
// =============================================================================

const config = {};
const currentUser = {
  userName: 'Naive Signalling Server',
  type: 'signalling',
};
const apps = [];

const wgOs = new WgOs({
  config,
  currentUser,
  apps,
});

const app = express();
const port = 1236;
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('It works!'));
app.post('/', async (req, res) => {
  const { wgOfferKey } = req.body;
  const { wgAnswer } = await wgOs.join(fromWgKey(wgOfferKey));
  const wgAnswerKey = toWgKey('wgAnswer')(wgAnswer);
  res.json({ wgAnswerKey });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
