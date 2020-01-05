// Imports
// =============================================================================

import { useEffect, useState } from '../shims/React';
import git from '../shims/git';
import AppContext from '../shims/AppContext';

// Main
// =============================================================================

//  TODO: remove window. usage
AppContext.on('transport:capabilities', async () => {
  AppContext.sendAll('transport:capabilitiesResponse', {
    value: ['fetch', 'push'],
  });
});

const onList = async ({ forPush = false } = {}) => {
  const refs = [
    'HEAD',
    ...(await window.gitInternals.GitRefManager.listRefs({
      fs: window.fs, //TODO
      gitdir: '.git',
      filepath: `refs`,
    })).map(r => `refs/${r}`),
  ];
  const value = await Promise.all(
    refs.map(async ref => {
      const sha = await window.git.resolveRef({ dir: '/', ref });
      return { sha, ref };
    }),
  );
  if (forPush)
    AppContext.sendAll('transport:listForPushResponse', {
      value,
    });
  else
    AppContext.sendAll('transport:listResponse', {
      value,
    });
};

AppContext.on('transport:list', () => onList());
AppContext.on('transport:listForPush', () => onList({ forPush: true }));

// HACK: Split huge files and send them in chunks. This is temporary, just to
//   write code faster realistically it should be implemented via streams or on
//   infrastructure level

AppContext.on('transport:fetch', async ({ value: [{ sha /*, ref */ }] }) => {
  const { /*object, type: objectType,*/ source } = await git.readObject({
    dir: '/',
    oid: sha,
    format: 'deflated',
  });

  if (source.startsWith('objects/pack')) {
    const packContents = await window.fs.readFile('.git/' + source);
    AppContext.sendAll('transport:fetchResponse', {
      value: Array.from(packContents),
      type: 'pack',
    });
  } else throw new Error('Not Implemented: it is not an pack');
});

export default ({ fs, onChange }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!fs) return;
    git.plugins.set('fs', fs);
    setIsReady(true);
  }, [fs]);

  const onClone = async url => {
    await git.clone({
      dir: '/',
      corsProxy: 'https://cors.isomorphic-git.org',
      url,
    });
    onChange();
  };

  return { isReady, onClone };
};
