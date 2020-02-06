// Imports
// =============================================================================

import React from '../shims/React';

import Files from './Files';
import Preview from './Preview';

// Main
// =============================================================================

export default function Main({
  //
  path,
  onPathChange,
  files,
  preview,
}) {
  return (
    <div>
      <hr />
      <button onClick={() => onPathChange('.')}>Root</button>
      <Files files={files} path={path} onPathChange={onPathChange} />
      <Preview preview={preview} />
    </div>
  );
}
