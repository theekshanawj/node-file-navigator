const fileNavigator = require('../index');

jest.mock('../util');
const util = require('../util');

describe('fileNavigator tests', () => {
  beforeAll(() => {
    // PromiseResolver should be as it is defined hence giving it's actual implementation
    // TODO: Find a better approach for this
    util.promiseResolver.mockImplementation((promise) => {
      if (promise instanceof Promise) return promise.then((value) => [null, value]).catch((error) => [error, null]);
      return [null, null];
    });
  });

  describe('file processing', () => {
    it('should navigate through files in a directory', async () => {
      const directory = 'dir/';
      const file = 'readme.text';
      const files = [file];

      // Mock file stat object
      const fileStats = {
        fpath: directory + file,
        fstat: {
          isFile: () => true,
        },
      };

      util.getFilesInDirectory.mockImplementation(() => Promise.resolve(files));

      util.getFileStat.mockImplementation(() => Promise.resolve(fileStats));

      const fileSkipPattern = jest.fn(() => false);
      const directorySkipPattern = jest.fn();

      const filesIterated = [];
      const callback = ({ fpath }) => {
        filesIterated.push(fpath);
      };

      await fileNavigator({ directory, fileSkipPattern, directorySkipPattern, callback });

      expect(fileSkipPattern).toBeCalled(); // Should be call this function for a file
      expect(directorySkipPattern).not.toBeCalled(); // Should not call this since no directory is present
      expect(filesIterated).toEqual(files.map((file) => directory + file));
    });
    it('should return an error if the callback is not defined', async () => {
      const error = new Error('error');
      let err = null;

      util.getFilesInDirectory.mockImplementation(() => Promise.reject(error));

      try {
        await fileNavigator({ directory: 'dir/' });
      } catch (e) {
        err = e;
      }
      expect(err).toEqual(new Error('No callback found'));
    });
    it('should return an error if getFilesInDirectory fails', async () => {
      const error = new Error('error');
      let err = null;

      util.getFilesInDirectory.mockImplementation(() => Promise.reject(error));

      try {
        await fileNavigator({ directory: 'dir/', callback: jest.fn() });
      } catch (e) {
        err = e;
      }
      expect(err).toEqual(new Error('Error getting files'));
    });
    it('should log when getFileStat fails and continue the processing', async () => {
      const directory = 'dir/';
      const file = 'readme.text';
      const corruptedfile = 'corruptedfile';
      const files = [file, corruptedfile];

      // Mock file stat object
      const fileStats = {
        fpath: directory + file,
        fstat: {
          isFile: () => true,
        },
      };

      util.getFilesInDirectory.mockImplementation(() => Promise.resolve(files));

      util.getFileStat.mockImplementation(
        (dir) => (dir.includes(corruptedfile) ? Promise.reject(new Error('error')) : Promise.resolve(fileStats)),
      );

      const fileSkipPattern = jest.fn(() => false);
      const directorySkipPattern = jest.fn();

      const filesIterated = [];
      const callback = ({ fpath }) => {
        filesIterated.push(fpath);
      };

      await fileNavigator({ directory, fileSkipPattern, directorySkipPattern, callback });

      expect(fileSkipPattern).toBeCalled();
      expect(filesIterated).toEqual([directory + file]);
    });
  });

  describe('directory processing', () => {
    it('should navigate through files in a directory if isRecursive is true', async () => {
      const directory = 'dir/';
      const file = 'anotherDirectory';
      const files = [file];

      // Mock file stat object
      const fileStats = {
        fpath: directory + file,
        fstat: {
          isFile: () => false,
          isDirectory: () => true,
        },
      };

      util.getFilesInDirectory.mockImplementation((dir) => Promise.resolve(dir === directory ? files : []));

      util.getFileStat.mockImplementation(() => Promise.resolve(fileStats));

      const fileSkipPattern = jest.fn();
      const directorySkipPattern = jest.fn(() => false);

      const filesIterated = [];
      const callback = ({ fpath }) => {
        filesIterated.push(fpath);
      };

      await fileNavigator({ directory, fileSkipPattern, directorySkipPattern, callback, isRecursive: true });

      expect(fileSkipPattern).not.toBeCalled();
      expect(directorySkipPattern).toBeCalled();
      expect(filesIterated).toEqual([]);
    });

    it('should not navigate through files in a directory if isRecursive is false', async () => {
      const directory = 'dir/';
      const file = 'anotherDirectory';
      const files = [file];

      // Mock file stat object
      const fileStats = {
        fpath: directory + file,
        fstat: {
          isFile: () => false,
          isDirectory: () => true,
        },
      };

      util.getFilesInDirectory.mockImplementation((dir) => Promise.resolve(dir === directory ? files : []));

      util.getFileStat.mockImplementation(() => Promise.resolve(fileStats));

      const directorySkipPattern = jest.fn(() => false);

      const filesIterated = [];
      const callback = ({ fpath }) => {
        filesIterated.push(fpath);
      };

      await fileNavigator({ directory, directorySkipPattern, callback, isRecursive: false });
    });

    it('should not navigate through files in a directory if directorySkipPattern is undefined', async () => {
      const directory = 'dir/';
      const file = 'anotherDirectory';
      const files = [file];

      // Mock file stat object
      const fileStats = {
        fpath: directory + file,
        fstat: {
          isFile: () => false,
          isDirectory: () => true,
        },
      };

      util.getFilesInDirectory.mockImplementation((dir) => Promise.resolve(dir === directory ? files : []));

      util.getFileStat.mockImplementation(() => Promise.resolve(fileStats));

      const fileSkipPattern = jest.fn();
      const directorySkipPattern = jest.fn(() => false);

      const filesIterated = [];
      const callback = ({ fpath }) => {
        filesIterated.push(fpath);
      };

      await fileNavigator({ directory, fileSkipPattern, directorySkipPattern, callback, isRecursive: false });

      expect(fileSkipPattern).not.toBeCalled();
      expect(directorySkipPattern).not.toBeCalled();
      expect(filesIterated).toEqual([]);
    });
  });
});
