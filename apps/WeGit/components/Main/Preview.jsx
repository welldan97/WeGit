// Imports
// =============================================================================

import React from 'react';
import ReactMarkdown from 'react-markdown';

// Main
// =============================================================================

export default function Preview({ previewFile }) {
  const isMarkdown = previewFile.name.toLowerCase().endsWith('.md');
  return (
    <div className="card bg-transparent">
      <div className="card-header">
        {'\u{1F4C4} '}
        {previewFile.name}
      </div>
      <div className="card-boody text-white p-4">
        {!isMarkdown && (
          <pre>
            <code>{previewFile.contents}</code>
          </pre>
        )}
        {isMarkdown && <ReactMarkdown source={previewFile.contents} />}
      </div>
    </div>
  );
}
