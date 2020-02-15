const { promiseResolver, getFilesInDirectory, getFileStat } = require('../util');

jest.mock('fs');
const fs = require('fs');

describe('Util tests', () => {
  describe('promiseResolver tests', () => {
    it('should return [null, value] when a promise is resolved', async () => {
      const value = {};
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(value);
        }, 250);
      });

      const [err, res] = await promiseResolver(promise);

      expect(err).toBeNull();
      expect(res).toEqual(value);
    });

    it('should return [err, null] when a promise is rejected', async () => {
      const error = new Error('error');
      const promise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(error);
        }, 250);
      });

      const [err, res] = await promiseResolver(promise);

      expect(res).toBeNull();
      expect(err).toEqual(error);
    });

    it('should resolve [null, null] if function is not called with a promise', async () => {
      const [err, res] = await promiseResolver(1);

      expect(res).toBeNull();
      expect(res).toBeNull();
    });
  });

  describe('getFilesInDirectory tests', () => {
    it('should get files inside a directory when no errors', async () => {
      const files = ['notes.text', 'directory'];
      fs.readdir.mockImplementation((path, callback) => {
        callback(null, files);
      });

      const filesInPath = await getFilesInDirectory('/path');

      expect(filesInPath).toEqual(['notes.text', 'directory']);
    });

    it('should get error object when readdir returns an error', async () => {
      const err = new Error('error reading path');
      fs.readdir.mockImplementation((path, callback) => {
        callback(err, null);
      });

      try {
        await getFilesInDirectory('/path');
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });

  describe('getFileStat tests', () => {
    it('should get the file stat of a file', async () => {
      const fileStat = {
        dev: 2114,
        ino: 48064969,
        mode: 33188,
        nlink: 1,
        uid: 85,
        gid: 100,
        rdev: 0,
        size: 527,
        blksize: 4096,
        blocks: 8,
        atimeMs: 1318289051000.1,
        mtimeMs: 1318289051000.1,
        ctimeMs: 1318289051000.1,
        birthtimeMs: 1318289051000.1,
      };
      const path = '/path';
      fs.stat.mockImplementation((path, callback) => {
        callback(null, fileStat);
      });

      const filesInPath = await getFileStat(path);

      expect(filesInPath).toEqual({ fpath: path, fstat: fileStat });
    });

    it('should return the error object if file stat fails', async () => {
      const err = new Error('error in file stat');
      fs.stat.mockImplementation((path, callback) => {
        callback(err, null);
      });

      try {
        await getFileStat('/path');
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });
});
