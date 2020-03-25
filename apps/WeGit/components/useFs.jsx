// Imports
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import * as BrowserFS from 'browserfs';

import promisifyFs from './lib/promisifyFs';

// Utils
// =============================================================================

const getCurrentFile = ({ fs }) => async path => {
  const isDirectory = (await fs.lstat(path)).isDirectory();

  return {
    isDirectory,
    name: path.replace(/^.*\//, ''),
  };
};

const getFilesAndPreviewFile = ({ fs }) => async (path, isDirectory) => {
  if (isDirectory) {
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

    const readmeFile = files.find(f => f.name.toLowerCase().includes('readme'));

    if (readmeFile) {
      const nextPreviewContents = await fs.readFile(
        `${path}/${readmeFile.name}`,
        'utf8',
      );
      return {
        files,
        previewFile: {
          name: readmeFile.name,
          contents: nextPreviewContents,
        },
      };
    } else
      return {
        files,
        previewFile: undefined,
      };
  } else {
    const nextPreviewContents = await fs.readFile(path, 'utf8');

    return {
      files: [],
      previewFile: {
        name: path.replace(/^.*\//, ''),
        contents: nextPreviewContents,
      },
    };
  }
};

const getHasRepo = ({ fs }) => async () => {
  try {
    await fs.lstat('.git');
    return true;
  } catch (e) {
    return false;
  }
};

// Main
// =============================================================================

export default ({ path: basePath }) => {
  const [state, setState] = useState({
    isReady: false,
    version: 0,
    path: basePath,
    files: [],
    previewFile: undefined,
    currentFile: { isDirectory: true, name: '' },
    hasRepo: false,
  });

  const {
    isReady,
    version,
    path,
    files,
    previewFile,
    currentFile,
    hasRepo,
  } = state;

  const baseFsRef = useRef();
  const fsRef = useRef();

  useEffect(() => {
    if (isReady) return;

    BrowserFS.configure({ fs: 'IndexedDB', options: {} }, err => {
      if (err) return console.log(err);
      baseFsRef.current = BrowserFS.BFSRequire('fs');
      fsRef.current = promisifyFs(baseFsRef.current);
      window.fs = fsRef.current;
      window.basefs = baseFsRef.current;
      setState({ ...state, isReady: true });
    });
  }, []);

  const onFsUpdate = () =>
    setState({
      ...state,
      version: state.version + 1,
    });

  useEffect(() => {
    if (!isReady) return;

    (async () => {
      const currentFile = await getCurrentFile({ fs })(basePath);
      const { files, previewFile } = await getFilesAndPreviewFile({ fs })(
        basePath,
        currentFile.isDirectory,
      );
      const hasRepo = await getHasRepo({ fs })();

      setState({
        ...state,
        path: basePath,
        files,
        previewFile,
        currentFile,
        hasRepo,
      });
    })();
  }, [basePath, isReady, version]);

  return {
    fs: baseFsRef.current,
    pfs: fsRef.current,
    onFsUpdate,

    isReady,
    path,
    files,
    previewFile,
    currentFile,
    hasRepo,
  };
};
