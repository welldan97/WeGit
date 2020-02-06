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
}) {
  return (
    <AppShell
      runningApp={runningApp}
      currentUser={currentUser}
      users={users}
      transport={transport}
    />
  );
}
