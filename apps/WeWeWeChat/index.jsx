// ==WgApp==
// @name WeWeWeChat
// @description Hello world application of WeGit
// @icon \u1F919
// @user { "userName": "welldan97" }
// ==/WgApp==

const renderPage = () => `
  <main>

    <h1>Chat</h1>
    <pre id="messages">
    </pre>

    <input id="input-message" type="text" />

    <button id="button-send">Send</button>
  </main>
`;

const createPage = () => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

AppContext.on('message', ({ type, payload }) => {
  if (type !== 'message') return;

  const { user, message } = payload;

  const $messages = document.getElementById('messages');
  $messages.innerText =
    $messages.innerText + '\n' + user.userName + ': ' + message;
});

const main = () => {
  const { user } = AppContext;
  let message = '';
  createPage();
  const $buttonSend = document.getElementById('button-send');
  const $inputMessage = document.getElementById('input-message');

  $buttonSend.addEventListener('click', () => {
    const $messages = document.getElementById('messages');
    $messages.innerText =
      $messages.innerText + '\n' + user.userName + ': ' + message;
    AppContext.sendAll({
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
