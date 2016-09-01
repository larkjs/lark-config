/**
 * Config loading module
 */
'use strict';

const $       = require('lodash');
const debug   = require('debug')('lark-config.index');
const assert  = require('assert');
const extend  = require('extend');
const fs      = require('fs');
const path    = require('path');
const yaml    = require('js-yaml');

debug('loading ...');

/**
 * exports function
 * @param config dir/ config obj
 * @param string
 * @returns {{}}
 */
function main (configPath, options = {}) {
    debug('main() called ...');

    let config = $.cloneDeep(configPath);
    if ('string' === typeof configPath) {
        debug('using path to load config ...');
        configPath = path.isAbsolute(configPath) ? configPath : path.join(path.dirname(process.mainModule.filename), configPath);
        config = loadConfigByPath(configPath);
    }
    else {
        configPath = null;
    }

    assert(config instanceof Object, 'Config must be an object or a valid config path');
    assert(options instanceof Object, 'Options must be an object');

    config = overwrite(config, options);

    config.configPath = configPath;
    return config;
}

/**
 * Load configs under a certain path
 * Path and file name will be regard as config names
 * file content will be regard as config contents
 */
function loadConfigByPath (configPath) {
    debug('loadConfigByPath() called, config path is ' + configPath);
    if (!fs.existsSync(configPath)) {
        throw new Error('Can not read config path ' + configPath);
    }
    let config = {};
    let nameList = fs.readdirSync(configPath);
    for (let name of nameList) {
        let filePath = path.join(configPath, name);
        debug('loading ' + filePath);
        let stat = fs.statSync(filePath);
        let type = null;
        if (stat.isFile()) {
            name = path.basename(filePath, path.extname(filePath));
            type = 'file';
        }
        else if (stat.isDirectory()) {
            type = 'directory';
        }
        else {
            continue;
        }
        debug('type is ' + type);
        try {
            config[name] = type === 'file' ? loadConfigByFile(filePath) : loadConfigByPath(filePath);
        }
        catch (e) {
            console.warn('Warning: failed to load config by ' + type + ' path ' + filePath + ' error message : ' + e.message);
        }
    };
    debug("loadConfigByPath() done!");
    return config;
}

/**
 * Load config by a file name
 **/
function loadConfigByFile(filePath) {
    debug("loadConfigByFile() called, file path is " + filePath);
    assert(fs.statSync(filePath).isFile(), 'Target [' + filePath + '] must be a file');

    debug("file validation ok!");
    let extname   = path.extname(filePath);
    let basename  = path.basename(filePath, extname);
    let content;
    debug("extname is " + extname);
    switch (extname) {
        case '.js': 
        case '.json': 
            debug("load .js/.json with require");
            content = require(filePath);
            break;
        case '.yaml': 
        case '.yml': 
            debug("load .yaml/.yml with yaml");
            content = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
            break;
    }
    debug("load ok!");
    return content;
};

/**
 * Overwrite configs with options
 **/
function overwrite (config, options) {
    debug("Config: overwriting start");
    assert(config instanceof Object, 'Config must be an object or a valid config path');
    assert(options instanceof Object, 'Options must be an object');

    let overwritings = [];
    for (let name in options) {
        if (!config[name]) {
            continue;
        }
        let overwriting;
        overwriting = config[name][options[name]];
        delete config[name];
        overwritings.push(overwriting);
    }
    for (let overwriting of overwritings) {
        config = extend(true, config, overwriting);
    }
    return config;
}

debug('Config: loaded');
module.exports = main;
