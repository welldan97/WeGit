// ==WgApp==
// @id WE-WE-WE-WE-WE-WECHAT
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
      <div class="row mt-4">
        <div class="col-12">
          <ul
            id="messages"
            class="
              list-group
              list-group-flush
              border-info
              border
              mb-4
              d-flex
              justify-content-end
              overflow-hidden
            "
            style="height: 40vh;"
            >
          </ul>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <form id="form-message" class="border border-info p-4">
            <h3 class="mb-4">Write Message:</h3>
            <div class="form-group">
              <input
                id="input-message"
                class="form-control"
                autocomplete="off"
                type="text"
              >
            </div>
              <button
                type="submit"
                class="btn btn-success btn-lg mt-4 d-block mx-auto"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
`;

const createPage = () => {
  const parser = new DOMParser();
  const nextDocument = parser.parseFromString(renderPage(), 'text/html');
  const pageContents = nextDocument.body.children[0];

  document.body.appendChild(pageContents);
};

const renderMessage = ({ userName, message, highlighted, godmode }) => {
  // Formatted current time
  const time = new Date().toLocaleDateString(navigator.language, {
    timeStyle: 'medium',
  });
  const godmodeStyles =
    "color: gold!important;font-family: Papyrus,'Comic Sans MS'";
  return `
  <li class="
        list-group-item
        border
        border-info
        text-info
        d-flex
        p-3
        bg-transparent
      "
      style="${godmode ? godmodeStyles : ''}"
      >
      <span class="mr-2 font-weight-bold ${highlighted ? 'text-success' : ''}" >
        ${userName || 'Anon'}(${time}):
      </span>
      <span>
        ${message}
      </span>
  </li>
`;
};

const addMessage = ({ user, message, highlighted, godmode }) => {
  const $messages = document.getElementById('messages');
  const parser = new DOMParser();
  const $messagesToAdd = parser.parseFromString(
    renderMessage({ userName: user.userName, message, highlighted, godmode }),
    'text/html',
  ).body.children[0];
  $messages.appendChild($messagesToAdd);
  if ($messages.children.length > 7) $messages.children[0].remove();
};

const safeWords = JSON.parse(
  atob(
    'eyJmdWNrIjoiZm9yayIsInNoaXQiOiJzaGlydCIsImJpdGNoIjoiYmVuY2giLCJhc3MiOiJhc2giLCJjb2NrIjoiY29yayIsImRpY2siOiJkaW5rIn0=',
  ),
);
const safe = message => {
  let nextMessage = message;
  Object.keys(safeWords).forEach(w => {
    nextMessage = nextMessage.replace(
      new RegExp(`\\b${w}`, 'gi'),
      safeWords[w],
    );
  });
  return nextMessage;
};

const main = () => {
  let message = '';
  let godmode = false;
  createPage();
  const $formMessage = document.getElementById('form-message');
  const $inputMessage = document.getElementById('input-message');

  AppShell.on('message', ({ type, payload }) => {
    if (type !== 'message') return;
    addMessage({ ...payload, highlighted: false });
  });

  $formMessage.addEventListener('submit', e => {
    e.preventDefault();
    const user = AppShell.currentUser;

    if (message.includes('iddqd')) {
      godmode = true;
    } else {
      AppShell.sendAll({
        type: 'message',
        payload: {
          user,
          message: safe(message),
          godmode,
        },
      });
    }
    addMessage({ user, message: safe(message), highlighted: true, godmode });

    message = '';
    $inputMessage.value = '';
  });

  $inputMessage.addEventListener('change', e => {
    message = e.target.value;
  });
};

if (typeof module !== 'undefined') module.exports = main;
else main();
