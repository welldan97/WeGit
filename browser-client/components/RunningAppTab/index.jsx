// Imports
// =============================================================================

import React, { memo } from 'react';

import AppShell from './AppShell';

// Main
// =============================================================================

export default memo(function RunningAppTab({
  runningApp,
  currentUser,
  users,
  transport,
  utils,
  isShown,
}) {
  const style = {
    width: '100%',

    maxHeight: 'calc(100% - 48px)',
    height: '100%',
  };
  return (
    <div hidden={!isShown} style={style}>
      <AppShell
        runningApp={runningApp}
        currentUser={currentUser}
        users={users}
        transport={transport}
        utils={utils}
      />
    </div>
  );
});
