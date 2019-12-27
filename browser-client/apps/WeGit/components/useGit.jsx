// Imports
// =============================================================================

import { useEffect, useState } from '../shims/React';
import git from '../shims/git';
import AppContext from '../shims/AppContext';

// Main
// =============================================================================

//  TODO: remove window. usage
AppContext.on('transport:capabilities', async () => {
  AppContext.sendAll('transport:capabilitiesResponse', { value: 'fetch\n\n' });
});

AppContext.on('transport:list', async () => {
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

  AppContext.sendAll('transport:listResponse', {
    value,
  });
});

// HACK: Split huge files and send them in chunks. This is temporary, just to
//   write code faster realistically it should be implemented via streams or on
//   infrastructure level

const MAX_SIZE = 10000;
const continueFetch = async function*({ sha, ref }) {
  const { /*object, type: objectType,*/ source } = await git.readObject({
    dir: '/',
    oid: sha,
    format: 'deflated',
  });

  if (source.startsWith('objects/pack')) {
    const packContents = await window.fs.readFile('.git/' + source);
    const partsCount = Math.ceil(packContents.length / MAX_SIZE);
    for (let i = 0; i < partsCount; i++) {
      const chunk = Array.from(
        packContents.slice(i * MAX_SIZE, (i + 1) * MAX_SIZE),
      );
      AppContext.sendAll('transport:fetchResponse', {
        chunk,
        totalLength: packContents.length,
        chunkNo: i,
        type: 'pack',
      });
      yield;
    }
  } else throw new Error('Not Implemented: it is not an pack');
};

let currentFetch;
AppContext.on('transport:fetch', (...args) => {
  currentFetch = continueFetch(...args);
  currentFetch.next();
});

AppContext.on('transport:fetchContinue', () => {
  if (!continueFetch) {
    throw new Error('tried to fetch more');
  }
  const { done } = currentFetch.next();
  if (done) {
    currentFetch = undefined;
  }
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
