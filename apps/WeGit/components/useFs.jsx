// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import * as BrowserFS from 'browserfs';

import promisifyFs from './lib/promisifyFs';

// Main
// =============================================================================

export default ({ path }) => {
  const [isReady, setIsReady] = useState(false);
  const baseFsRef = useRef();
  const fsRef = useRef();

  useEffect(() => {
    if (isReady) return;

    BrowserFS.configure({ fs: 'IndexedDB', options: {} }, err => {
      if (err) return console.log(err);
      baseFsRef.current = BrowserFS.BFSRequire('fs');
      fsRef.current = promisifyFs(baseFsRef.current);
      window.fs = fsRef.current;
      setIsReady(true);
    });
  }, []);

  const [version, setVersion] = useState(0);
  const onFsUpdate = () => setVersion(version + 1);

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!isReady) return;

    (async () => {
      //
      const pathIsDirectory = (await fs.lstat(path)).isDirectory();

      if (pathIsDirectory) {
        const fileNames = (await fs.readdir(path)).filter(f => f !== '.git');

        const files = await Promise.all(
          fileNames.map(async name => {
            const isDirectory = (await fs.lstat(
              `${path}/${name}`,
            )).isDirectory();

            return {
              name,
              isDirectory,
            };
          }),
        );
        setFiles(files);
        setPreview(undefined);
      } else {
        const nextPreview = await fs.readFile(path, 'utf8');
        setFiles([]);
        setPreview(nextPreview);
      }
      //
    })();
  }, [path, isReady, version]);

  const [hasRepo, setHasRepo] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      try {
        await fs.lstat('.git');
        setHasRepo(true);
      } catch (e) {
        setHasRepo(false);
      }
    })();
  }, [isReady, version]);

  return {
    fs: baseFsRef.current,
    isReady,
    onFsUpdate,
    hasRepo,
    files,
    preview,
  };
};
