var fs = require('fs');
var path = require('path');
// Recursive mkdir

// mkdirsSync(path, [mode=(0777^umask)]) -> pathsCreated
exports.mkdirsSync = function (dirname, mode) {
  if (mode === undefined) mode = 0777 ^ process.umask();
  var pathsCreated = [], pathsFound = [];
  var fn = dirname;
  while (true) {
    try {
      var stats = fs.statSync(fn);
      if (stats.isDirectory())
        break;
      throw new Error('Unable to create directory at '+fn);
    }
    catch (e) {
      pathsFound.push(fn);
      fn = path.dirname(fn);
    }
  }
  for (var i=pathsFound.length-1; i>-1; i--) {
    var fn = pathsFound[i];
    fs.mkdirSync(fn, mode);
    pathsCreated.push(fn);
  }
  return pathsCreated;
};

// mkdirs(path, [mode=(0777^umask)], [callback(err, pathsCreated)])
exports.mkdirs = function (dirname, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode;
    mode = undefined;
  }
  if (mode === undefined) mode = 0777 ^ process.umask();
  var pathsCreated = [], pathsFound = [];
  var makeNext = function() {
    var fn = pathsFound.pop();
    if (!fn) {
      if (callback) callback(null, pathsCreated);
    }
    else {
      fs.mkdir(fn, mode, function(err) {
        if (!err) {
          pathsCreated.push(fn);
          makeNext();
        }
        else if (callback) {
          callback(err);
        }
      });
    }
  }
  var findNext = function(fn){
    fs.stat(fn, function(err, stats) {
      if (err) {
        pathsFound.push(fn);
        findNext(path.dirname(fn));
      }
      else if (stats.isDirectory()) {
        // create all dirs we found up to this dir
        makeNext();
      }
      else {
        if (callback) {
          callback(new Error('Unable to create directory at '+fn));
        }
      }
    });
  }
  findNext(dirname);
};