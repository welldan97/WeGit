// Imports
// =============================================================================

import React from 'react';

// Main
// =============================================================================

export default function Apps({ apps, onRun, onDelete }) {
  return (
    <div className="row">
      <div className="col-12">
        <ul className="list-group list-group-flush mt-4">
          {apps.map(a => {
            const type = 'info';

            return (
              <li
                className={`list-group-item
                    border border-${type} text-${type}
                    d-flex p-3`}
                key={a.id}
              >
                <div>
                  <span
                    style={{
                      fontSize: '70px',
                      lineHeight: '70px',
                      margin: '0',
                    }}
                  >
                    {a.icon}
                  </span>
                </div>
                <div className="mx-3 flex-grow-1 w-25">
                  <h3 className="h4">
                    {a.name}{' '}
                    <small>
                      by <strong>{a.user.userName || 'Unknown user'}</strong>
                    </small>
                  </h3>
                  <div>
                    <p
                      className="mb-0"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {a.description}
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-success btn-block btn-sm"
                    onClick={() => onRun(a.id)}
                  >
                    ▶️ Run
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-block btn-sm"
                    onClick={() => onDelete(a.id)}
                  >
                    × Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
