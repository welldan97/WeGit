// Imports
// =============================================================================

import React, { useCallback, useState } from '../shims/React';

// Main
// =============================================================================

const defaultUrl = 'https://github.com/piuccio/cowsay';

export default function Main({
  //
  onClone,
}) {
  const [cloneUrl, setCloneUrl] = useState(defaultUrl);
  const onCloneUrlChange = useCallback(e => setCloneUrl(e.target.value), [
    setCloneUrl,
  ]);

  const onCloneSubmit = useCallback(() => onClone(cloneUrl), [cloneUrl]);

  return (
    <div>
      No repo created
      <hr />
      <input
        value={cloneUrl}
        onChange={onCloneUrlChange}
        style={{ width: '200px' }}
      />
      <button onClick={onCloneSubmit}>clone</button>
      <br />
    </div>
  );
}
