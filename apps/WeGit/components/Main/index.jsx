// Imports
// =============================================================================

import React, { memo, useCallback, useState } from 'react';

import NoRepo from './NoRepo';

// Main
// =============================================================================

export default function Main({ hasRepo, progress, onClone }) {
  return <>{hasRepo || <NoRepo progress={progress} onClone={onClone} />}</>;
}
