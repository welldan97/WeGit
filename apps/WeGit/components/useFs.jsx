// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import * as BrowserFS from 'browserfs';

import promisifyFs from './lib/promisifyFs';

// Main
// =============================================================================

export default ({ path }) => {
  const [isReady, setIsReady] = useState(false);
  const [passedPath, setPassedPath] = useState(path);
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
  const [previewFile, setPreviewFile] = useState();
  const [currentFile, setCurrentFile] = useState({ isDirectory: true });

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
              `${path === '/' ? '' : path}/${name}`,
            )).isDirectory();

            return {
              name,
              isDirectory,
            };
          }),
        );
        setFiles(files);
        const readmeFile = files.find(f =>
          f.name.toLowerCase().includes('readme'),
        );
        if (readmeFile) {
          const nextPreviewContents = await fs.readFile(
            `${path}/${readmeFile.name}`,
            'utf8',
          );
          setPreviewFile({
            name: readmeFile.name,
            contents: nextPreviewContents,
          });
        } else setPreviewFile(undefined);
      } else {
        const nextPreviewContents = await fs.readFile(path, 'utf8');
        setFiles([]);
        setPreviewFile({
          name: path.replace(/^.*\//, ''),
          contents: nextPreviewContents,
        });
      }
      setPassedPath(path);
      setCurrentFile({
        isDirectory: pathIsDirectory,
        name: path.replace(/^.*\//, ''),
      });

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
    passedPath,
    isReady,
    onFsUpdate,
    hasRepo,
    files,
    previewFile,
    currentFile,
  };
};
