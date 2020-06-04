// Imports
// =============================================================================

import React, { useEffect, useRef, useState } from 'react';

import sharedVersionStateMiddleware from 'wegit-lib/utils/sharedVersionStateMiddleware';

// Utils
// =============================================================================

const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7);

// Main
// =============================================================================

const initialState = {
  a: 0,
  b: randomString(),
};

const showInnerState = true;

export default function App({ AppShell }) {
  const [state, setState] = useState(initialState);
  const [innerState, setInnerState] = useState({});
  const [isSynchronizing, setIsSynchronizing] = useState(true);
  const sharedStateRef = useRef();

  const onChangeState = async nextState => {
    //setIsSynchronizing(true);
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 3000 + 1000),
    );
    setState(nextState);
    //setIsSynchronizing(false);
  };

  const onInnerStateChange = async nextState => {
    console.log('statechange', JSON.stringify(nextState, undefined, 2));
    setInnerState(nextState);
  };

  const stateComparator = async (x, y) => {
    return Math.sign((x.a - y.a) * 100 + x.b.localeCompare(y.b));
  };
  useEffect(() => {
    (async () => {
      const { send, onMessage, sharedState } = sharedVersionStateMiddleware({
        onChangeState,
        onInnerStateChange,
        onSynchronizing: setIsSynchronizing,
        stateComparator,
        initialState: state,
        initialUsers: AppShell.users,
      })({
        onMessage: message => {
          console.log(message, '!!!!!!!');
        },
        send: (userId, message, options) =>
          AppShell.send(userId, message, options),
      });
      AppShell.on('message', onMessage);
      AppShell.on('saveUsers', sharedState.saveUsers);
      setTimeout(sharedState.ready, Math.random() * 3000 + 1000);

      sharedStateRef.current = sharedState;
    })();
  }, []);

  const onIncrementA = () => {
    const nextState = { ...state, a: state.a + 1 };
    setState(nextState);
    sharedStateRef.current.changeState(nextState);
  };

  const onRandomB = () => {
    const nextState = { ...state, b: randomString() };
    setState(nextState);
    sharedStateRef.current.changeState(nextState);
  };
  return (
    <div className="container mb-4" style={{ maxWidth: '720px' }}>
      <div className="row mt-4">
        <div className="col-12">
          <h2>{AppShell.currentUser.id}</h2>
          <h2>{isSynchronizing ? 'Synchronizing' : ''}&nbsp;</h2>
          <hr />

          <button
            onClick={onIncrementA}
            type="button"
            className="btn btn-success btn-lg mr-4"
          >
            Increment 'a'
          </button>
          {/*  <button
            onClick={onRandomB}
            type="button"
            className="btn btn-success btn-lg"
          >
            Random 'b'
          </button>*/}
          <hr />
          <pre>
            {showInnerState &&
              JSON.stringify(
                innerState,
                (key, value) => (typeof value === 'undefined' ? null : value),
                2,
              )}
          </pre>
          <hr />
          <pre>{JSON.stringify(state, undefined, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
