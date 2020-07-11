// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function MeshState({ state }) {
  return (
    <p>
      {state === 'connected' && (
        <span className="text-success">{'\u{2705}'} connected</span>
      )}
      {state === 'connecting' && (
        <span className="text-info">{'\u{23f3}'} connecting</span>
      )}
      {state === 'disconnected' && (
        <span className="text-danger">{'\u{274c}'} disconnected</span>
      )}
    </p>
  );
}
