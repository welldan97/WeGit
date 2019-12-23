const renderPage = () => `
  <main>

    <h1>Chat</h1>
    <pre id="messages">
    </pre>

    <input id="input-message" type="text" />

    <button id="button-send">Send</button>
  </main>
`;

const createPage = options => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(options), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

AppContext.on('message', ({ user, message }) => {
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
    AppContext.sendAll('message', {
      user,
      message,
    });
  });

  $inputMessage.addEventListener('change', e => {
    message = e.target.value;
  });
};

main();
