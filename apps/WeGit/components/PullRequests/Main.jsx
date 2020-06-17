// Imports
// =============================================================================

import React, { useState } from 'react';

// Main
// =============================================================================

export default function Main({ pullRequests, onCreate, onShow }) {
  return (
    <div className="row">
      <div className="col-12 ">
        <ul className="list-group list-group-flush mt-4">
          {pullRequests.map(p => (
            <li
              className="list-group-item
                      border border-info text-info
                      d-flex justify-content-between align-items-center"
              key={p.id}
              onClick={() => onShow(p)}
              style={{ cursor: 'pointer' }}
            >
              {'\u{21A9}'}&nbsp; {p.title}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-success btn-lg mt-4 mx-auto d-block"
          onClick={onCreate}
        >
          + Create
        </button>
      </div>
    </div>
  );
}
