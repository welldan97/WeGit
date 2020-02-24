// Imports
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import * as BrowserFS from 'browserfs';

import promisifyFs from './lib/promisifyFs';

// Main
// =============================================================================

let basefs;
let fs;

export default ({ path }) => {
  // NOTE: use version to update once files change
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    BrowserFS.configure({ fs: 'IndexedDB', options: {} }, err => {
      if (err) return console.log(err);
      basefs = BrowserFS.BFSRequire('fs');
      fs = promisifyFs(basefs);
      window.fs = fs;
      setIsReady(true);
    });
  }, []);

  const [version, setVersion] = useState(0);
  const triggerFsUpdated = useCallback(() => setVersion(version + 1), [
    version,
  ]);

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!isReady) return;
    (async () => {
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
    fs: basefs,
    isReady,
    version,
    triggerFsUpdated,
    hasRepo,
    files,
    preview,
  };
};
