// Imports
// =============================================================================

import { useEffect, useState } from '../shims/React';
import git from '../shims/git';

// Main
// =============================================================================

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
      singleBranch: true,
    });
    onChange();
  };

  return { isReady, onClone };
};
