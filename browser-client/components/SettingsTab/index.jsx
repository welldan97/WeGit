// Imports
// =============================================================================

import React, { useEffect, useState } from 'react';

// Main
// =============================================================================

export default function SettingsTab({ user, config, onUpdateSettings }) {
  // TODO: move from here
  const onReset = async () => {
    localStorage.clear();
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) registration.unregister();
    setTimeout(() => location.reload(true), 300);
  };

  const [nextUserName, setNextUserName] = useState(user.userName || '');
  const [nextConfigText, setNextConfigText] = useState(
    JSON.stringify(config, undefined, 2) || '',
  );

  useEffect(() => {
    if (nextUserName !== user.userName) setNextUserName(user.userName || '');
    if (nextConfigText !== user.userName)
      setNextConfigText(JSON.stringify(config, undefined, 2) || '');
  }, [user.userName, config]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const nextConfig = nextConfigText
          ? JSON.parse(nextConfigText)
          : undefined;
        onUpdateSettings({
          user: { ...user, userName: nextUserName || undefined },
          config: nextConfig,
        });
      }}
      style={{ display: 'contents' }}
    >
      <div className="row mt-4">
        <div className="col-12">
          <h2>Settings</h2>
        </div>
      </div>
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
        <div className="col-12 border border-danger pt-3 pb-3">
          <>
            <div className="alert alert-danger" role="alert">
              ⚠️ Danger zone: Changing these settings would make you disconnect
              from the network.
            </div>
            <div className="alert alert-secondary" role="alert">
              ℹ️ Here come connection settings: ice, stun, turn so on. For now
              it's just a JSON config. But later, we'll go crazy and build a lot
              of beautifulest knobs, and wheels, and scrollers and carousels…
              Yeah, stay tuned.
            </div>

            <label htmlFor="config">Config</label>
            <textarea
              id="config"
              className="form-control text-monospace"
              rows="6"
              placeholder="Fill in your Config in JSON here, or leave it blank to go with defaults"
              value={nextConfigText}
              onChange={e => setNextConfigText(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-danger btn-lg mt-4 mx-auto d-block"
              onClick={onReset}
            >
              Complete reset
            </button>
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
    </form>
  );
}
