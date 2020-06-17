// Imports
// =============================================================================

import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

// Main
// =============================================================================

export default function Create({ pullRequest, onCancel, onDelete, onMerge }) {
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <h3 className="mb-4">{pullRequest.title}</h3>

          <div className="d-flex align-items-baseline justify-content-between">
            <div>
              From: {'\u{1F500} '} {pullRequest.from}
            </div>
            {'\u{279e} '}
            <div>
              To: {'\u{1F500} '} {pullRequest.to}
            </div>
          </div>

          <p className="mt-4 border border-info p-3">{pullRequest.comment}</p>

          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mr-4 d-block"
              onClick={() => onCancel()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mr-4 d-block"
              onClick={() => onDelete(pullRequest)}
            >
              Delete
            </button>
            <button
              type="submit"
              className="btn btn-success btn-lg mt-4 d-block"
              onClick={() => onMerge(pullRequest)}
            >
              Merge
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
