// Imports
// =============================================================================

import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

// Main
// =============================================================================

export default function Create({
  currentBranch,
  branches,
  onCancel,
  onSubmit,

  libHelpers,
}) {
  const [from, setFrom] = useState(
    branches.find(b => b !== currentBranch) || currentBranch,
  );
  const [isFromOpen, setIsFromOpen] = useState(false);

  const [to, setTo] = useState(currentBranch);
  const [isToOpen, setIsToOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    (async () => {
      //TODO: show commits diff
      //const x = await commitOidsBetween({ has });
    })();
  }, [from, to]);
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <h3 className="mb-5">Create New Pull Request</h3>

          <div className="d-flex align-items-baseline justify-content-between">
            <div>
              From:{' '}
              <div
                className="dropdown d-inline-block mx-2"
                onClick={() => setIsFromOpen(!isFromOpen)}
              >
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  style={{ width: '200px' }}
                >
                  {'\u{1F500} '}
                  <span className="mx-1">{from}</span>
                </button>
                <div
                  className={`dropdown-menu ${isFromOpen ? 'show' : ''}`}
                  aria-labelledby="dropdownMenuButton"
                >
                  {branches.map(b => (
                    <a
                      className="dropdown-item"
                      href="#"
                      key={b}
                      onClick={e => {
                        e.preventDefault();
                        setFrom(b);
                      }}
                    >
                      {b}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {'\u{279e} '}
            <div>
              To:{' '}
              <div
                className="dropdown d-inline-block ml-2"
                onClick={() => setIsToOpen(!isToOpen)}
              >
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  style={{ width: '200px' }}
                >
                  {'\u{1F500} '}
                  <span className="mx-1">{to}</span>
                </button>
                <div
                  className={`dropdown-menu ${isToOpen ? 'show' : ''}`}
                  aria-labelledby="dropdownMenuButton"
                >
                  {branches.map(b => (
                    <a
                      className="dropdown-item"
                      href="#"
                      key={b}
                      onClick={e => {
                        e.preventDefault();
                        setTo(b);
                      }}
                    >
                      {b}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form
            className="mt-4"
            onSubmit={e => {
              e.preventDefault();
              onSubmit({ from, to, title, comment, id: nanoid() });
            }}
          >
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                placeholder="Title"
                onChange={e => setTitle(e.target.value || '')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                className="form-control"
                rows="6"
                placeholder="Comment"
                value={comment}
                onChange={e => setComment(e.target.value || '')}
              />
            </div>

            <div className="d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-danger btn-lg mt-4 mr-4 d-block"
                onClick={() => onCancel()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success btn-lg mt-4 d-block"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
