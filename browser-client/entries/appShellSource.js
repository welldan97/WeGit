// Imports
// =============================================================================

import { readFileSync } from 'fs';

// Main
// =============================================================================

// NOTE: Build it before using it, even in dev! npm run build:appShell
// NOTE: parcel builder loads it and replace it with contents automatically
// https://github.com/parcel-bundler/parcel/issues/970#issuecomment-381403710

export default readFileSync(__dirname + '../../dist/appShell.js', 'utf-8');
