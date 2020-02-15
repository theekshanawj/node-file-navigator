# Node file navigator
This simple application will enable you to navigate through a directory; recursively if required, filtering files and directories and applying custom processing on the file selected.
[![Build Status](https://api.travis-ci.com/theekshanawj/node-file-navigator.svg?branch=master)](https://api.travis-ci.com/theekshanawj/node-file-navigator)


## Required 

Stable NodeJS version

## Dependencies

None

## How to add to your application

Add [this](https://www.npmjs.com/package/node-file-navigator) module to your application as a dependency

```
npm i node-file-navigator
```

```javascript
const fileNavigator = require('node-file-navigator');
```

## API Reference

### Method invocation

```javascript
fileNavigator({ directory, fileSkipPattern, isRecursive, directorySkipPattern, callback, ...other })
```

### Paramaters

Parameter | Type | Usage | Example
--- | :--- | --- | --- | 
direcorty | `String` | directory for navigation | '/user/home/app'
fileSkipPattern | `Function : ({ path, stat })` | If returns `true` processing of the file is skipped | `({path}) => (/.css$/.test(path))`
isRecursive | `Boolean` | should navigate nested directories | `true`
directorySkipPattern | `Function : ({ path, stat })` | If returns `true` navigation of the directory is skipped | `({path}) => (/node_modules$/.test(path))`
callback | `Function: ({ path, stat})` | Define the file opration | `({ path }) => { console.log(path); }`
other | `Object` | N/A | N/A

### Example

```javascript
/**
 * An application to navigate through all .js files in the working directory
 * and nested directories and print the paths in the terminal without going through node_modules folder.
 *
*/
// Import 
const fileNavigator = require('node-file-navigator');

const directory = __dirname;
fileSkipPattern = ({ path }) => !/.js$/.test(path);
isRecursive = true;
directorySkipPattern = ({ path }) => /node_modules/.test(path);
callback = ({ path }) => { console.log(path); }

// Invoke
fileNavigator({ directory, fileSkipPattern, isRecursive, directorySkipPattern, callback, ...other })

```

