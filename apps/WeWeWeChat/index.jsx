// ==WgApp==
// @name WeWeWeChat
// @description Hello world application of WeGit
// @icon '\u{1F919}'
// @user { "userName": "welldan97" }
// ==/WgApp==

const renderPage = () => `
  <main>
    <div class="container" style="max-width: 720px">
      <div class="row mt-4">
        <div class="col-12">
          <h1>Chat</h1>
        </div>
      </div>

      <ul class="list-group list-group-flush mt-4" id="messages">
        <li class="list-group-item
            border border-info text-info
            d-flex p-3">
            Hello!
        </li>
        <li class="list-group-item
            border border-info text-info
            d-flex p-3">
            Hello!
        </li>
      </ul>

      <input id="input-message" type="text" />

      <button id="button-send">Send</button>
    </div>
  </main>
`;

const createPage = () => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

const renderMessage = ({ userName, message, highlighted }) => `
  <li class="list-group-item
      border border-info text-info
      d-flex p-3">
      <span class="mr-2 font-weight-bold ${highlighted ? 'text-success' : ''}">
        ${userName}:
      </span>
      <span>
        ${message}
      </span>
  </li>
`;

const addMessage = ({ user, message, highlighted }) => {
  const $messages = document.getElementById('messages');
  const parser = new DOMParser();
  const $messagesToAdd = parser.parseFromString(
    renderMessage({ userName: user.userName, message, highlighted }),
    'text/html',
  ).body.children[0];
  $messages.appendChild($messagesToAdd);
};

AppShell.on('message', ({ type, payload }) => {
  if (type !== 'message') return;
  addMessage({ ...payload, highlighted: false });
});

const main = () => {
  const { currentUser: user } = AppShell;
  let message = '';
  createPage();
  const $buttonSend = document.getElementById('button-send');
  const $inputMessage = document.getElementById('input-message');

  $buttonSend.addEventListener('click', () => {
    addMessage({ user, message, highlighted: true });

    AppShell.sendAll({
      type: 'message',
      payload: {
        user,
        message,
      },
    });
  });

  $inputMessage.addEventListener('change', e => {
    message = e.target.value;
  });
};

main();
