/**
 * Created by mdemo on 14/12/8.
 */


var path = require('path');
var root = path.dirname(process.mainModule.filename);
var fs = require('fs');
var merge = require('merge');
var yaml = require('js-yaml');

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
  // env config require
  if (fs.existsSync(envPath)) {
    configs = merge(configs, require(envPath));
  }
  // other config require
  if (fs.existsSync(configPath)) {
    fs.readdirSync(configPath).forEach(function (name) {
      var basename = path.basename(name, path.extname(name));
      switch (path.extname(name)) {
        case '.js':
          addConfig(configs, basename, require(path.join(configPath, name)));
          break;
        case '.json':
          var content = require(path.join(configPath, name));
          addConfig(configs, basename, content);
          break;
        case '.yml':
          var content = yaml.safeLoad(fs.readFileSync(path.join(configPath, name), 'utf8'));
          addConfig(configs, basename, content);
          break;
      }
    });
  }
  configs.environment = env;
  configs.configPath  = configPath;
  return configs;
};

function addConfig(configs, name, config) {
    if (config[name] && Object.keys(config).length === 1) {
        config = config[name];
    }
    configs[name] = merge(configs[name] || {}, config);
}
