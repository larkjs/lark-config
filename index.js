/**
 * Created by mdemo on 14/12/8.
 */
'use strict';

import _debug from 'debug';
import caller from 'caller';
import extend from 'extend';
import fs     from 'fs';
import path   from 'path';
import yaml   from 'js-yaml';

const debug = _debug('lark-config');
const root  = path.dirname(process.mainModule.filename);

/**
 * exports function
 * @param config dir/ config obj
 * @param string
 * @returns {{}}
 */
export default (configPath, options = {}) => {
    debug('Config: start');
    let config = null;
    if (configPath instanceof Object) {
        debug('Config: first param is config itself, use it directly');
        config = configPath;
        configPath = null;
    }
    else if ('string' === typeof configPath) {
        debug('Config: first param is config\'s path, use it to load configs');
        let callerPath = caller();
        debug('Config: caller is ' + callerPath);
        configPath = path.join(path.dirname(callerPath), configPath);
        debug('Config: config path is ' + configPath);
        config = loadConfigByPath(configPath);
    }
    if (options && options instanceof Object) {
        debug("Config: overriding...");
        config = override(config, options);
    }
    config.configPath = configPath;
    return config;
}

/**
 * Load configs under a certain path
 * Path and file name will be regard as config names
 * file content will be regard as config contents
 */
function loadConfigByPath (configPath) {
    debug("Config: start to load by config path : " + configPath);
    if (!fs.existsSync(configPath)) {
        throw new Error('Can not read config path ' + configPath);
    }
    let config = {};
    let nameList = fs.readdirSync(configPath);
    for (let name of nameList) {
        let filePath = path.join(configPath, name);
        debug('Config: loading ' + filePath);
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
        debug('Config: type is ' + type);
        try {
            config[name] = type === 'file' ? loadConfigByFile(filePath) : loadConfigByPath(filePath);
        }
        catch (e) {
            console.warn('Warning: failed to load config by ' + type + ' path ' + filePath + ' error message : ' + e.message);
        }
    };
    debug("Config: load by config path done!");
    return config;
}

/**
 * Load config by a file name
 **/
function loadConfigByFile(filePath) {
    debug("Config: start to load by file name : " + filePath);
    if (!fs.existsSync(filePath)) {
        throw new Error('Can not read config path ' + filePath);
    }
    let stat = fs.statSync(filePath);
    if (!stat.isFile()) {
        throw new Error('File ' + filePath + ' must be a file');
    }
    debug("Config: file validation ok!");
    let extname   = path.extname(filePath);
    let basename  = path.basename(filePath, extname);
    let content;
    debug("Config: extname is " + extname);
    switch (extname) {
        case '.js': 
            debug("Config: load .js with require");
            content = require(filePath).default;
            break;
        case '.json': 
            debug("Config: load .json with require");
            content = require(filePath);
            break;
        case '.yaml': 
        case '.yml': 
            debug("Config: load .yaml/.yml with yaml");
            content = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
            break;
    }
    debug("Config: load ok!");
    return content;
};

/**
 * Override configs with options
 **/
function override (config, options) {
    debug("Config: overriding...");
    if (!(config instanceof Object) || !(options instanceof Object)) {
        throw new Error("Both config and options must be Object");
    }
    let overridings = [];
    for (let name in options) {
        let overriding;
        try {
            overriding = config[name][options[name]];
        }
        catch (e) {
            console.log("Warning: can not override config " + name + ", error message : " + e.message);
        }
        delete config[name];
        overridings.push(overriding);
    }
    for (let overriding of overridings) {
        config = extend(true, config, overriding);
    }
    return config;
}

debug('Config: loaded');
