/**
 * In this example total number of lines in .js files are calculated.
 * All the *test*.js, *mock*.js and *package*.json files are skipped.
 * __tests__, __mocks__ and node_modules directories will be ignored.
 */
const { exec } = require('child_process');
const fileNavigator = require('./index.js');

// Get the 3rd param from commandline as the directory name. Fallback is __dirname
const roorDir = process.argv[2] || __dirname;

// From .js files, *test*.js or *mock*.js or *package*.json will be skipped
const fileSkipPattern = ({ fpath }) => !/.js$/.test(fpath) || /(test|mocks|package).js/i.test(fpath);

// From directories __tests__, __mocks__ and node_modules will be ignored
const directorySkipPattern = ({ fpath }) => /(__tests__|__mocks__|node_modules)/i.test(fpath);

// Allow recursive navigation
const isRecursive = true;

// Counting js files and number of files.
let lineCount = 0;
let fileCount = 0;

// Callback function will use grep command to get the line number count
// Sophisticated logic can be used here.
const callback = ({ fpath }) => {
  exec(`grep -c ^ "${fpath}"`, (err, output) => {
    if (err) {
      console.error('Error executing the command', fpath);
      return;
    }
    fileCount++;
    lineCount += parseInt(output, 10); // Parse the string into a int
    console.log(fpath, fileCount, lineCount);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      });
    });
  });
};

fileNavigator({ directory: roorDir, fileSkipPattern, isRecursive, directorySkipPattern, callback });
