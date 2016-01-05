/**
 * Created by mdemo on 14/12/8.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug3.default)('lark-config');
const root = _path2.default.dirname(process.mainModule.filename);

/**
 * exports function
 * @param config dir/ config obj
 * @param string
 * @returns {{}}
 */

exports.default = function (configPath) {
    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    debug('Config: start');
    let config = null;
    if (configPath instanceof Object) {
        debug('Config: first param is config itself, use it directly');
        config = configPath;
        configPath = null;
    } else if ('string' === typeof configPath) {
        debug('Config: first param is config\'s path, use it to load configs');
        if (!_path2.default.isAbsolute(configPath)) {
            debug('Config: not absolute path');
            let appPath = process.mainModule.filename;
            debug('Config: app path is ' + appPath);
            configPath = _path2.default.join(_path2.default.dirname(appPath), configPath);
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
    let config = {};
    let nameList = _fs2.default.readdirSync(configPath);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = nameList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let name = _step.value;

            let filePath = _path2.default.join(configPath, name);
            debug('Config: loading ' + filePath);
            let stat = _fs2.default.statSync(filePath);
            let type = null;
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
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    ;
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
    let stat = _fs2.default.statSync(filePath);
    if (!stat.isFile()) {
        throw new Error('File ' + filePath + ' must be a file');
    }
    debug("Config: file validation ok!");
    let extname = _path2.default.extname(filePath);
    let basename = _path2.default.basename(filePath, extname);
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
    let overwritings = [];
    for (let name in options) {
        let overwriting;
        try {
            overwriting = config[name][options[name]];
        } catch (e) {
            console.log("Warning: can not overwrite config " + name + ", error message : " + e.message);
        }
        delete config[name];
        overwritings.push(overwriting);
    }
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = overwritings[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let overwriting = _step2.value;

            config = (0, _extend2.default)(true, config, overwriting);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return config;
}

debug('Config: loaded');
