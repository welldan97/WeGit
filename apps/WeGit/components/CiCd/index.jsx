// Imports
// =============================================================================

import { nanoid } from 'nanoid';
import React, { useEffect, useRef, useState } from 'react';

import { readFileSync } from 'fs';

const testsPage = readFileSync(__dirname + '/testsPage.html', 'utf-8');

// Utils
// =============================================================================

// TODO: duplicate with Files
const formatCommitDate = commitHolder =>
  (commitHolder &&
    commitHolder.commit &&
    commitHolder.commit.committer &&
    commitHolder.commit.committer.timestamp &&
    new Date(commitHolder.commit.committer.timestamp * 1000)
      .toISOString()
      .replace(/T.*$/, '')) ||
  '';

const formatCommitMessage = commitHolder =>
  (commitHolder &&
    commitHolder.commit &&
    commitHolder.commit.message.split('\n')[0]) ||
  '';

// Main
// =============================================================================

export default function CiCd({
  ciCd,
  ciCdState,
  commitHoldersLog,
  onBuild: baseOnBuild,
}) {
  const [state, setState] = useState({
    testsStatus: 'clean',
    testsOid: undefined,
    testsId: undefined,
  });

  const {
    testsStatus,
    testsOid,
    testsId,
    //
  } = state;

  const iframeRef = useRef(undefined);

  const style = {
    width: '100%',
    height: '100vh',
    border: 'none',
  };

  useEffect(() => {
    if (testsStatus === 'done') return;
    if (!ciCdState.tests.some(t => t.id === testsId && t.oid === testsOid))
      return;
    setState({ ...state, testsStatus: 'done' });
  }, [ciCdState, state, testsStatus]);

  useEffect(() => {
    if (!ciCd) return;
    if (!iframeRef.current) return;
    if (testsStatus !== 'running') return;

    setTimeout(() => {
      //iframeRef.current.eval(ci.testsTarget);
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'run',
          payload: {
            ciCd,
            oid: testsOid,
            id: testsId,
          },
        },
        '*',
      );
    }, 1000);
  }, [ciCd, testsStatus]);

  const onRun = oid => {
    setState({
      ...state,
      testsStatus: 'running',
      testsOid: oid,
      testsId: nanoid(),
    });
  };

  const onClose = oid => {
    setState({
      ...state,
      testsStatus: 'clean',
      testsOid: undefined,
      testsId: undefined,
    });
  };

  const [runAutomatically, setRunAutomatically] = useState(false);

  useEffect(() => {
    setState({
      ...state,
      testsStatus: 'clean',
      testsOid: undefined,
      testsId: undefined,
    });
  }, [commitHoldersLog]);

  useEffect(() => {
    if (!runAutomatically) return;
    if (testsStatus !== 'clean') return;
    if (ciCdState.tests.find(t => t.oid === commitHoldersLog[0].oid)) return;
    onRun(commitHoldersLog[0].oid);
  }, [testsStatus, commitHoldersLog, runAutomatically]);

  const onBuild = () => {
    const evaluateBuild = new Function('source', ciCd.build);
    const result = evaluateBuild(ciCd.buildTarget);
    baseOnBuild(result);
  };
  return (
    <div className="row mt-4">
      <div className="col-12">
        <h3>Build</h3>
        {ciCd.build && (
          <button
            type="button"
            className="btn btn-success btn-lg mt-4 mb-4"
            onClick={onBuild}
          >
            {'\u{1F477} '} Build App
          </button>
        )}
        {!ciCd.build && (
          <div class="alert alert-secondary" role="alert">
            Please set up your build settings to make this accessible
          </div>
        )}
        <hr />
        <h3 className="mt-4">Tests</h3>

        {!ciCd.tests && (
          <div class="alert alert-secondary" role="alert">
            Please set up your tests settings to make this accessible
          </div>
        )}
        {ciCd.tests && (
          <>
            <div className="mt-2">
              <input
                type="checkbox"
                id="runAutomatically"
                name="runAutomatically"
                className="mr-2"
                checked={runAutomatically}
                onChange={e => {
                  setRunAutomatically(e.target.checked);
                }}
              />
              <label htmlFor="runAutomatically">Run Automatically</label>
            </div>
            <h4 className="mt-4">Latest commits:</h4>
            <ul className="list-group list-group-flush mt-4">
              {commitHoldersLog.map((c, i) => (
                <li
                  className="list-group-item border border-info p-4"
                  key={c.oid}
                >
                  <div className="d-flex w-100">
                    <div className="mr-3">
                      {(testsStatus === 'clean' || testsOid !== c.oid) && (
                        <button
                          type="button"
                          className="btn btn-success btn-block btn-sm"
                          onClick={() => onRun(c.oid)}
                          disabled={i !== 0}
                        >
                          {'\u{25b6}'} Run
                        </button>
                      )}
                      {testsStatus === 'running' && testsOid == c.oid && (
                        <button
                          type="button"
                          className="btn btn-danger btn-block btn-sm"
                          onClick={() => onRun(c.oid)}
                          disabled
                        >
                          {'\u{23f9}'} Stop
                        </button>
                      )}
                      {testsStatus === 'done' && testsOid == c.oid && (
                        <button
                          type="button"
                          className="btn btn-info btn-block btn-sm"
                          onClick={() => onClose(c.oid)}
                        >
                          × Close
                        </button>
                      )}
                    </div>
                    <div>
                      <strong className="mr-3 text-nowrap">
                        {c.commit.author.name}
                      </strong>
                    </div>
                    <div
                      className="flex-fill text-truncate mr-3"
                      style={{ maxWidth: '170px' }}
                    >
                      {formatCommitMessage(c)}
                    </div>
                    <div className="text-right text-nowrap mr-3">
                      <span>{c.oid.slice(0, 7)}</span>
                      {formatCommitDate(c)}
                    </div>
                    <div
                      className="text-right text-nowrap mr-3 align-items-baseline"
                      style={{ width: '50px' }}
                    >
                      {ciCdState.tests.find(t => t.oid === c.oid)
                        ?.failuresCount === 0 && (
                        <>
                          {'\u{2705}'}
                          <small className="text-success"> passing</small>
                        </>
                      )}
                      {ciCdState.tests.find(t => t.oid === c.oid)
                        ?.failuresCount > 0 && (
                        <>
                          {'\u{274c}'}
                          <small className="text-danger"> failing</small>
                        </>
                      )}
                    </div>
                  </div>
                  {testsStatus !== 'clean' && c.oid === testsOid && (
                    <iframe
                      className="border border-info mt-4"
                      srcDoc={testsPage}
                      style={style}
                      ref={iframeRef}
                    ></iframe>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
