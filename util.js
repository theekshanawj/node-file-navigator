const fs = require('fs');

/**
 * Get the files inside a directory.
 * Wrap the fs.readdir by a promise
 */
const getFilesInDirectory = (directory) =>
  new Promise((resolve, reject) => {
    fs.readdir(directory, (error, files) => {
      if (error) reject(error);
      resolve(files);
    });
  });

/**
 * Get the file stat of the file/directory
 * Wrap the fs.stat by a promise
 */
const getFileStat = (fpath) =>
  new Promise((resolve, reject) => {
    fs.stat(fpath, (error, fstat) => {
      if (error) reject(error);
      resolve({ fpath, fstat });
    });
  });

/**
 * Resolve any promise or reject and return in the form [error, result] for easy access
 */
const promiseResolver = (promise) => promise.then((value) => [null, value]).catch((error) => [error, null]);

module.exports = { getFilesInDirectory, getFileStat, promiseResolver };
