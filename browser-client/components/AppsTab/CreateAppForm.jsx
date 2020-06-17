// Imports
// =============================================================================

import React, { useState } from 'react';
// Utils
// =============================================================================

const getRandomIcon = () => {
  // Shourt emoji range in unicode
  //const emojiRange = [0x1f18e, 0x1f550];
  const emojiRange = [0x1f300, 0x1f3fa];
  const codePoint = Math.round(
    Math.random() * (emojiRange[1] - emojiRange[0]) + emojiRange[0],
  );
  return String.fromCodePoint(codePoint);
};

// Main
// =============================================================================

export default function CreateAppForm({ onCancel, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(getRandomIcon());
  const [source, setSource] = useState(
    `console.log('${icon} Hello from App!')`,
  );

  return (
    <div className="row mt-4">
      <div className="col-12">
        <form
          className="border border-info p-4"
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ name, description, source, icon });
          }}
        >
          <h3 className="mb-4">Create New App</h3>
          <div className="form-group">
            <label htmlFor="icon">Icon (1 char)</label>
            <input
              type="text"
              className="form-control"
              id="icon"
              value={icon}
              placeholder="App Name"
              onChange={e => setIcon(e.target.value[0] || '')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">App Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              placeholder="App Name"
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              className="form-control"
              id="description"
              value={description}
              placeholder="Description"
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="source">Source code</label>
            <textarea
              id="source"
              className="form-control text-monospace"
              rows="6"
              placeholder="Source code"
              value={source}
              onChange={e => setSource(e.target.value)}
            />
          </div>{' '}
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
  );
}
