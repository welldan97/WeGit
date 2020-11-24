// Imports
// =============================================================================

import { readFileSync } from 'fs';

import React, { useEffect } from 'react';

import Animation from './Animation';

// Main
// =============================================================================

export default function AboutTab() {
  useEffect(() => {
    document.body.style.background = 'black';
    return () => {
      document.body.style.background = '';
    };
  });
  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <h2>About</h2>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <Animation />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <p>Thank you for trying out WeGit! I hope you liked it :)</p>
          <p>
            Note that we are still in a proof of concept stage of development,
            and many things are going to break in many different funny ways.
          </p>
          <p>
            Nevertheless, the work will be going on, and we are going to make it
            solid. Please support the project:
          </p>
          <ul>
            <li>Share it with your friends and coworkers.</li>
            <li>
              Contribute to the project on{' '}
              <a href="https://github.com/welldan97/WeGit">github</a>
            </li>
            <li>
              Send bitcoins to <strong className="text-primary">TODO</strong>
            </li>
          </ul>
          <p>Thanks!</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h3>Acknowledgments</h3>

          <p>
            Thanks to the opensource projects, without which this project would
            not be possible:
          </p>
          <ul>
            <li>
              <a href="https://isomorphic-git.org">isomorphic-git</a> - amazing
              project which does most of the job - it implement git in browser.
            </li>
            <li>
              <a href="https://github.com/feross/simple-peer">simple-peer</a> -
              great library to ease WebRTC development,tackling a lot of issues
            </li>
            <li>
              <a href="https://github.com/jvilk/BrowserFS">BrowserFS</a> -
              Filesystem inside the browser
            </li>
            <li>
              <a href="https://github.com/ai/nanoid">nanoid</a> - light library
              for IDs generation
            </li>
            <li>
              <a href="https://github.com/jimmywarting/StreamSaver.js">
                StreamSaver.js
              </a>
              - useful lib for generating files to download programmatically
            </li>
          </ul>

          <p>
            Thanks to{' '}
            <a href="https://codepo8.github.io/logo-o-matic">logo-o-matic</a>{' '}
            for generated logo, using font created by Di-Art.
          </p>
          <p>
            Thanks to <a href="https://youtu.be/ntklTGMzL28">Chiptune Planet</a>{' '}
            for making the music which I used on this page.
          </p>
          <p>
            Thanks to{' '}
            <a href="https://www.youtube.com/watch?v=GIIIha-NxHw">Z-Exit</a> for
            the translated lyrics of the song originally written by Viktor Tsoi
          </p>
        </div>
      </div>

      <div className="row my-4">
        <div className="col-12">
          <h3>License (MIT)</h3>
          <pre>
            {`
Copyright (c) 2020 Dmitry Yakimov (welldan97)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`}
          </pre>
        </div>
      </div>
    </>
  );
}
