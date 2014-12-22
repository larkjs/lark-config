/**
 * Created by mdemo on 14/12/8.
 */


var path = require('path');
var root = require('app-root-path').toString();
var fs = require('fs');
var merge = require('merge');

/**
 * exports function
 * @param options
 * @returns {{}}
 */
module.exports = function (options) {
  var options = options || {};
  var env = options.env || process.env.NODE_ENV || 'development';
  var directory = options.directory || 'config';
  var configPath = path.join(root, directory);
  var envPath = path.join(configPath, 'env', env + '.js');
  var configs = {};
  configs.environment = env;
  // env config require
  if (fs.existsSync(envPath)) {
    configs = merge(configs, require(envPath));
  }
  // other config require
  if (fs.existsSync(configPath)) {
    fs.readdirSync(configPath).forEach(function (name) {
      if (path.extname(name) === '.js') {
        configs = merge(configs, require(path.join(configPath, name)));
      }
    });
  }
  return configs;
};
