// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function MeshState({ state }) {
  return (
    <p>
      {state === 'connected' && (
        <span className="text-success">✅connected</span>
      )}
      {state === 'connecting' && (
        <span className="text-info">⏳connecting</span>
      )}
      {state === 'disconnected' && (
        <span className="text-danger">❌disconnected</span>
      )}
    </p>
  );
}
