// Imports
// =============================================================================

import React, { useEffect, useState } from 'react';

// Main
// =============================================================================

export default function SettingsTab({ user, onUpdateSettings }) {
  const [nextUserName, setNextUserName] = useState(user.userName || '');
  useEffect(() => {
    if (nextUserName === user.userName) return;
    setNextUserName(user.userName || '');
  }, [user.userName]);

  return (
    <form
      className="container"
      onSubmit={e => {
        e.preventDefault();
        onUpdateSettings({
          user: { ...user, userName: nextUserName || undefined },
        });
      }}
    >
      <h2>Settings</h2>
      <>
        <div className="row mt-4">
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                className="form-control"
                id="userName"
                value={nextUserName}
                placeholder="Unknown user"
                onChange={e => setNextUserName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <>
              <div className="alert alert-secondary" role="alert">
                ℹ️ Here come connection settings: ice, stun, turn so on. For now
                it's just a text config. But later, we'll go crazy and build a
                lot of beautifulest knobs, and weels, and scrollers and
                carousels… Yeah, stay tuned.
              </div>
            </>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 ">
            <button
              type="submit"
              className="btn btn-success btn-lg mt-4 mx-auto d-block"
            >
              Save
            </button>
          </div>
        </div>
      </>
    </form>
  );
}
