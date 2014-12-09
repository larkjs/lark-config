/**
 * Created by mdemo on 14/12/8.
 */


var path = require('path');
var dirname = require('app-root-path').toString();

module.exports = function config(options) {
  var options = options || {};
  var env = options.env || 'development';
  var directory = options.directory || 'configs';
  var configs = require(path.join(dirname, directory, env));
  return configs;
};
