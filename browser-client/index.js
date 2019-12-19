// Imports
// =============================================================================

import WgAppStore from 'wegit-lib/WgAppStore';
import 'regenerator-runtime/runtime';

// Main
// =============================================================================

const url = 'http://localhost:2345';

let wgAppStore;

const userName = Math.random()
  .toString(36)
  .substring(7);

const user = { userName };

const renderPage = ({ user, url }) => `
  <main>

    <h1>
      ${user.userName}
    </h1>
    <pre id="status">
    </pre>

    <hr />
    <h2>Apps</h2>
    <ul id="apps-list">
    </ul>
    <input id="input-load-app" type="text"/>

    <hr />
    <h2>Create</h2>

    <input id="input-create" type="text"/>

    <button id="button-create">Create</button>
    <hr />

    <h2>Join</h2>

    <input id="input-join" type="text"/>
    <hr />

  </div>
    <iframe id="iframe" src="${url}" style="width: 100%;height: 100%" sandbox="allow-scripts allow-same-origin"></iframe>
  </main>
`;

const createPage = options => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(options), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

const changeState = ({ onAppRun }) => {
  const $status = document.getElementById('status');
  const $appsList = document.getElementById('apps-list');

  $status.innerText = wgAppStore
    .getMeshState()
    .map(cs => `${cs.userName || 'unknown'}: ${cs.connectionState}`)
    .join('\n');

  $appsList.innerHTML = '';
  const $appsListContents = document.createDocumentFragment();

  wgAppStore.apps.forEach(app => {
    const $li = document.createElement('li');
    $li.innerHTML = `
      ${app.name || 'unknown app'}
      <button type="button" data-id="${app.id}">Run</button>
    `;

    $li.children[0].addEventListener('click', e =>
      onAppRun(e.target.dataset.id),
    );
    $appsListContents.appendChild($li);
  });

  $appsList.appendChild($appsListContents);
};

const onAppRun = appId => {
  const $iframe = document.getElementById('iframe');

  const app = wgAppStore.apps.find(a => a.id === appId);

  $iframe.contentWindow.postMessage(
    {
      type: 'transport:init',
      payload: {
        app,
        user,
      },
    },
    '*',
  );
};

const main = () => {
  createPage({ url, user });
  const $buttonCreate = document.getElementById('button-create');
  const $inputCreate = document.getElementById('input-create');
  const $inputJoin = document.getElementById('input-join');

  const $iframe = document.getElementById('iframe');

  const $inputLoadApp = document.getElementById('input-load-app');

  wgAppStore = new WgAppStore({ user });
  window.wgAppStore = wgAppStore;
  wgAppStore.addEventListener('change', () => changeState({ onAppRun }));

  $buttonCreate.addEventListener('click', async () => {
    const { wgOfferKey: nextWgOfferKey } = await wgAppStore.create();

    navigator.clipboard.writeText(nextWgOfferKey);
  });

  $inputCreate.addEventListener('input', e => {
    wgAppStore.establish(e.target.value);
  });

  $inputJoin.addEventListener('input', async e => {
    const wgOfferKey = e.target.value;

    const { wgAnswerKey: nextWgAnswerKey } = await wgAppStore.join(wgOfferKey);

    navigator.clipboard.writeText(nextWgAnswerKey);
  });

  //

  $inputLoadApp.addEventListener('input', e => {
    const source = e.target.value;

    wgAppStore.createApp({ source });
  });

  window.addEventListener('message', e => {
    const { type, payload } = e.data;
    console.log(type, payload, 'hh');
    wgAppStore.sendAll({ type: `app:${type}`, payload });
  });

  wgAppStore.addEventListener('message', e => {
    const { type, payload } = e.data;
    if (type !== 'transport:init' && !type.startsWith('app:')) return;
    $iframe.contentWindow.postMessage({ type, payload }, '*');
  });
  // dev
  setTimeout(() => onAppRun(), 100);
};

main();
