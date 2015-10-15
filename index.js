/**
 * Created by mdemo on 14/12/8.
 */
'use strict';

const path  = require('path');
const root  = path.dirname(process.mainModule.filename);
const fs    = require('fs');
const merge = require('merge');
const yaml  = require('js-yaml');

/**
 * exports function
 * @param options
 * @returns {{}}
 */
module.exports = (options) => {
  options = options || {};
  let env = options.env || process.env.NODE_ENV || 'development';
  let directory = options.directory || 'config';
  let configPath = path.join(root, directory);
  let envPath = path.join(configPath, 'env', env + '.js');
  let configs = {};
  // env config require
  if (fs.existsSync(envPath)) {
    configs = merge(configs, require(envPath));
  }
  // other config require
  if (fs.existsSync(configPath)) {
    fs.readdirSync(configPath).forEach((name) => {
      let basename = path.basename(name, path.extname(name));
      let content;
      switch (path.extname(name)) {
        case '.js':
          addConfig(configs, basename, require(path.join(configPath, name)));
          break;
        case '.json':
          content = require(path.join(configPath, name));
          addConfig(configs, basename, content);
          break;
        case '.yml':
          content = yaml.safeLoad(fs.readFileSync(path.join(configPath, name), 'utf8'));
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
    if (name == 'index'){
        configs = merge(configs, config)
    }else{
        if (config[name] && Object.keys(config).length === 1) {
            config = config[name];
        }
        configs[name] = merge(configs[name] || {}, config);
    }
}
