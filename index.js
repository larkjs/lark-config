/**
 * Created by mdemo on 14/12/8.
 */


var path = require('path');
var rootPath = require('app-root-path').toString();
var fs = require('fs');

module.exports = function (app, options) {
  if (!app || (app && !(typeof app.listen === 'function'))) {
    throw new Error('you need pass app');
  }
  if (app.config) return;
  var options = options || {};
  var env = options.env || process.env.NODE_ENV || 'development';
  var directory = options.directory || 'configs';
  var dirname = path.join(rootPath, directory, env + '.json');
  if (!fs.existsSync(dirname)) {
    throw new Error(env + ".json doesn't exist");
  }
  var configs = require(dirname);
  app.configs = configs;
  return function *config(next) {
    if (this.config) return;
    this.configs = configs;
    yield next;
  }
};
