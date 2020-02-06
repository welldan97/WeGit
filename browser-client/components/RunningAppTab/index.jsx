// Imports
// =============================================================================

import React from 'react';

import AppShell from './AppShell';

// Main
// =============================================================================

export default function RunningAppTab({
  runningApp,
  currentUser,
  users,
  transport,
  utils,
}) {
  return (
    <AppShell
      runningApp={runningApp}
      currentUser={currentUser}
      users={users}
      transport={transport}
      utils={utils}
    />
  );
}
