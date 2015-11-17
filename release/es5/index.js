/**
 * Created by mdemo on 14/12/8.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _caller = require('caller');

var _caller2 = _interopRequireDefault(_caller);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)('lark-config');
var root = _path2.default.dirname(process.mainModule.filename);

/**
 * exports function
 * @param config dir/ config obj
 * @param string
 * @returns {{}}
 */

exports.default = function (configPath) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug('Config: start');
    var config = null;
    if (configPath instanceof Object) {
        debug('Config: first param is config itself, use it directly');
        config = configPath;
        configPath = null;
    } else if ('string' === typeof configPath) {
        debug('Config: first param is config\'s path, use it to load configs');
        if (!_path2.default.isAbsolute(configPath)) {
            debug('Config: not absolute path');
            var callerPath = (0, _caller2.default)();
            debug('Config: caller is ' + callerPath);
            configPath = _path2.default.join(_path2.default.dirname(callerPath), configPath);
        }
        debug('Config: config path is ' + configPath);
        config = loadConfigByPath(configPath);
    }
    if (options && options instanceof Object) {
        debug("Config: config object is ok");
        config = overwrite(config, options);
    }
    config.configPath = configPath;
    return config;
};

/**
 * Load configs under a certain path
 * Path and file name will be regard as config names
 * file content will be regard as config contents
 */

function loadConfigByPath(configPath) {
    debug("Config: start to load by config path : " + configPath);
    if (!_fs2.default.existsSync(configPath)) {
        throw new Error('Can not read config path ' + configPath);
    }
    var config = {};
    var nameList = _fs2.default.readdirSync(configPath);
    for (var _iterator = nameList, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var name = _ref;

        var filePath = _path2.default.join(configPath, name);
        debug('Config: loading ' + filePath);
        var stat = _fs2.default.statSync(filePath);
        var type = null;
        if (stat.isFile()) {
            name = _path2.default.basename(filePath, _path2.default.extname(filePath));
            type = 'file';
        } else if (stat.isDirectory()) {
            type = 'directory';
        } else {
            continue;
        }
        debug('Config: type is ' + type);
        try {
            config[name] = type === 'file' ? loadConfigByFile(filePath) : loadConfigByPath(filePath);
        } catch (e) {
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
    if (!_fs2.default.existsSync(filePath)) {
        throw new Error('Can not read config path ' + filePath);
    }
    var stat = _fs2.default.statSync(filePath);
    if (!stat.isFile()) {
        throw new Error('File ' + filePath + ' must be a file');
    }
    debug("Config: file validation ok!");
    var extname = _path2.default.extname(filePath);
    var basename = _path2.default.basename(filePath, extname);
    var content = undefined;
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
            content = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(filePath, 'utf8'));
            break;
    }
    debug("Config: load ok!");
    return content;
};

/**
 * Overwrite configs with options
 **/
function overwrite(config, options) {
    debug("Config: overwriting start");
    if (!(config instanceof Object) || !(options instanceof Object)) {
        throw new Error("Both config and options must be Object");
    }
    var overwritings = [];
    for (var name in options) {
        var overwriting = undefined;
        try {
            overwriting = config[name][options[name]];
        } catch (e) {
            console.log("Warning: can not overwrite config " + name + ", error message : " + e.message);
        }
        delete config[name];
        overwritings.push(overwriting);
    }
    for (var _iterator2 = overwritings, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
        } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
        }

        var overwriting = _ref2;

        config = (0, _extend2.default)(true, config, overwriting);
    }
    return config;
}

debug('Config: loaded');
