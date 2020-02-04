/**
 * This node module can be used to navigate through files and directories (recursively) and perform action on files.
 * Files and directories can be filtered when navigating.
 * callback can be defined to process files/directories as required.
 *
 * @author Theekshana Wijesinghe
 */
const path = require('path');
const { getFilesInDirectory, getFileStat, promiseResolver } = require('./util');

/**
 * Main function: Recursive function.
 * @param {string} directory Directory for navigation.
 * @param (Function} FileSkipPattern Skip files if this function returns true.
 * @param {boolean} isRecursive Do recursive navigation.
 * @param {Function} directorySkipPattern Skip directories if this function returns true.
 * @param {Function} callback Function which performs the processing on file. {path, stat} Are passed for callback function.
 * @param {*} other Other arguments passed.
 * @returns {Promise<Promise|undefined>} Returns when all file navigations are complete.
 */
const fileNavigator = async ({ directory, fileSkipPattern, isRecursive, directorySkipPattern, callback, ...other }) => {
  const activeDir = directory || __dirname; // If directory not defined, get the directory node is being executed

  const [err, files] = await promiseResolver(getFilesInDirectory(activeDir));
  if (!err) {
    return processFiles({
      directory,
      files,
      fileSkipPattern,
      isRecursive,
      directorySkipPattern,
      callback,
      ...other,
    });
  }
  return Promise.reject(new Error('Error getting files'));
};

/**
 * Iterate through each files in the directory.
 */
const processFiles = async ({
  directory,
  files,
  fileSkipPattern,
  isRecursive,
  directorySkipPattern,
  callback,
  ...other
}) => {
  if (!files) {
    return;
  }

  const fileStatPromises = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    fileStatPromises.push(getFileStat(filePath));
  });

  const [errors, fileStats] = await promiseResolver(Promise.all(fileStatPromises));

  if (errors) {
    // Log errors if any
    console.error('Error occurred while reading files', errors);
  }

  if (fileStats) {
    fileStats.forEach(({ fpath, fstat }) => {
      processSingleFile({
        fpath,
        fstat,
        fileSkipPattern,
        isRecursive,
        directorySkipPattern,
        callback,
        ...other,
      });
    });
  }
};

/**
 * Process a single file.
 */
const processSingleFile = async ({
  fpath,
  fstat,
  fileSkipPattern,
  isRecursive,
  directorySkipPattern,
  callback,
  ...other
}) => {
  if (fstat.isFile()) {
    if (!fileSkipPattern({ fpath, fstat })) callback({ fpath, fstat });
  } else if (fstat.isDirectory()) {
    // If a directory, check if recursion is required and should the directory be skipped
    // And make a recursive all on the new directory
    if (isRecursive && !directorySkipPattern({ fpath, fstat })) {
      return fileNavigator({
        directory: fpath,
        fileSkipPattern,
        isRecursive,
        directorySkipPattern,
        callback,
        ...other,
      });
    }
  }
};

module.exports = fileNavigator;
