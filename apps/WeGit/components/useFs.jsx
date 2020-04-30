// Imports
// =============================================================================

import { promisify } from 'util';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as BrowserFS from 'browserfs';

// Utils
// =============================================================================

const exists = ({ fs }) => async path => {
  const lstat = promisify(fs.lstat);

  try {
    await lstat(path);
    return true;
  } catch (e) {
    return false;
  }
};

const getCurrentFile = ({ fs }) => async path => {
  const lstat = promisify(fs.lstat);
  const isDirectory = (await lstat(path)).isDirectory();

  return {
    isDirectory,
    name: path.replace(/^.*\//, ''),
  };
};

const getFilesAndPreviewFile = ({ fs }) => async (path, isDirectory) => {
  const readdir = promisify(fs.readdir);
  const lstat = promisify(fs.lstat);
  const readFile = promisify(fs.readFile);

  if (isDirectory) {
    const fileNames = (await readdir(path)).filter(f => f !== '.git');

    const rawFiles = await Promise.all(
      fileNames.map(async name => {
        const isDirectory = (await lstat(
          `${path === '/' ? '' : path}/${name}`,
        )).isDirectory();

        return {
          name,
          isDirectory,
        };
      }),
    );

    const files = [
      ...rawFiles
        .filter(f => f.isDirectory)
        .sort((a, b) => a.name.localeCompare(b.name)),
      ...rawFiles
        .filter(f => !f.isDirectory)
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];

    const readmeFile = files.find(f => f.name.toLowerCase().includes('readme'));

    if (readmeFile) {
      const nextPreviewContents = await readFile(
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
    const nextPreviewContents = await readFile(path, 'utf8');

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
  return await exists({ fs })('/.git');
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

  const fsRef = useRef();

  useEffect(() => {
    if (isReady) return;
    BrowserFS.configure({ fs: 'IndexedDB', options: {} }, err => {
      if (err) return console.log(err);
      fsRef.current = BrowserFS.BFSRequire('fs');
      window.fs = fsRef.current;
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

  const onReset = async () => {
    const readdir = promisify(fs.readdir);
    const lstat = promisify(fs.lstat);
    const unlink = promisify(fs.unlink);
    const rmdir = promisify(fs.rmdir);

    // FIXME: copypasta, probably better to remove indexdb

    const deleteFolderRecursive = async path => {
      if (path === '/' || exists({ fs })(path)) {
        await Promise.all(
          (await readdir(path)).map(async file => {
            const curPath = path === '/' ? '/' + file : path + '/' + file;
            if ((await lstat(curPath)).isDirectory()) {
              await deleteFolderRecursive(curPath);
            } else {
              await unlink(curPath);
            }
          }),
        );

        if (path !== '/') await rmdir(path);
      }
    };
    await deleteFolderRecursive('/');
    onFsUpdate();
  };

  return {
    fs: fsRef.current,
    onFsUpdate,

    isReady,
    path,
    files,
    previewFile,
    currentFile,
    hasRepo,
    onReset,
  };
};
