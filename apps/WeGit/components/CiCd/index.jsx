// Imports
// =============================================================================

import React, { useEffect, useRef, useState } from 'react';

import { readFileSync } from 'fs';

const testsPage = readFileSync(__dirname + '/testsPage.html', 'utf-8');

// Main
// =============================================================================

export default function CiCd({ ciCd }) {
  const iframeRef = useRef(undefined);

  const style = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  useEffect(() => {
    if (!ciCd) return;
    if (!iframeRef.current) return;
    console.log(ciCd);
    setTimeout(() => {
      //iframeRef.current.eval(ci.testsTarget);
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'run',
          payload: {
            ciCd,
          },
        },
        '*',
      );
    }, 1000);
    /*
    iframeRef.current.eval(ci.tests);
    iframeRef.current.eval('mocha.run();');*/
  }, [ciCd]);

  return <iframe srcDoc={testsPage} style={style} ref={iframeRef}></iframe>;
}
