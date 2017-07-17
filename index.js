/**
 * Load configs from directories
 **/
'use strict';

const assert    = require('assert');
const extend    = require('extend');
const fs        = require('fs');
const misc      = require('vi-misc');
const path      = require('path');
const yaml      = require('js-yaml');
const Directory = require('directoryfiles');

misc.promisify.all(fs);

/**
 * Lark Config supports loading and parse yaml, json, js and node files
 * Here are the loader functions and their map relations
 **/
function readYaml(filePath) {
    return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
}

function requireClone(filePath) {
    let module = require(filePath);
    if ('object' === typeof module) {
        module = extend(true, {}, module);
    }
    return module;
}

const parserMap = new Map([
    ['.js',   requireClone],
    ['.json', requireClone],
    ['.node', requireClone],
    ['.yaml', readYaml],
    ['.yml',  readYaml]
]);

/**
 * Lark Config is a class and provides methods to load, set and get configs.
 * Typically you are supposed to use `await config.use(directoryPath)` to load all configs from a certain
 * directory. Lark Config will load all files[1] under that directory and transform the
 * into a tree[2] stored in `this.config`.
 * Then when you use this.get('key-a/key-b/key-c') to access a value of a config, it's equivalent to
 * access the value of `this.config['key-a']['key-b']['key-c'], which is also equivalent to access the
 * value of one of the following ways:
 *    `require('{appRoot}/{directoryPath}/key-a')['key-b']['key-c']` or
 *    `require('{appRoot}/{directoryPath}/key-a/key-b')['key-c']` or
 *    `require('{appRoot}/{directoryPath}/key-a/key-b/key-c')`
 * What if there are more than one case on above occurs, such as the case
 * both `{appRoot}/{directoryPath}/key-a` and `{appRoot}/{directoryPath}/key-a/key-b` exists ?
 * It should throw an error like 'Duplicated Key ...', by the depend module `directoryfiles`,
 * by calling `directory.mapKeys`[3]. So make sure there's no duplicated cases.
 *
 * [1] Files with extend name in the parser map. Or the file will be ignored.
 * [2] Actually it is an pure JS Object.
 * [3] Map keys will change the keys into new ones. But new key should not overwrite existing keys, otherwise
 *     I don't know which should be kept and which should be discard.
 **/
class LarkConfig {
    constructor() {
        this.config = {};
    }
    /**
     * Get a config in a none-existing name causes an error.
     * Any return value may be legal for a config, so I can not use return value to tell errors.
     * Use this.has to check before calling this.get.
     **/
    get(name) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        for (let key of names) {
            assert(pointer.hasOwnProperty(key), 'Invalid name, no such a config path');
            pointer = pointer[key];
        }
        return pointer;
    }
    /**
     * The param overwrite:
     *     If true, Lark Config suppose you are going to change a config, and assert
     *     the config should exist with that name.
     *     If false, Lark Config will create a new one if config not exist.
     **/
    set(name, value, overwrite = false) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        let lastKey = names.pop();
        for (let key of names) {
            assert(!overwrite || pointer.hasOwnProperty(key), 'Invalid name, no such a config path');
            pointer[key] = pointer[key] || {};
            pointer = pointer[key];
        }
        assert(!overwrite || pointer.hasOwnProperty(lastKey), 'Invalid name, no such a config path');
        pointer[lastKey] = value;
        return this;
    }
    has(name) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        let lastKey = names.pop();
        for (let key of names) {
            if (!pointer.hasOwnProperty(key)) return false;
            pointer = pointer[key];
        }
        return pointer.hasOwnProperty(lastKey);
    }
    remove(name, overwrite = false) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        let lastKey = names.pop();
        for (let key of names) {
            if (!pointer.hasOwnProperty(key)) {
                assert(!overwrite, 'Invalid name, no such a config path');
                return this;
            }
            pointer = pointer[key];
        }
        assert(!overwrite || pointer.hasOwnProperty(lastKey), 'Invalid name, no such a config path');
        delete pointer[lastKey];
        return this;
    }
    async use(config = {}) {
        if ('string' === typeof config) {
            const target = misc.path.absolute(config);
            const stats = await fs.statAsync(target);
            if (stats.isFile()) {
                config = parserMap.get(path.extname(target))(target);
            }
            else {
                const directory = new Directory();
                await directory.load(target);
                config = directory.filter(filePath => parserMap.has(path.extname(filePath)))
                    .mapKeys(key => path.basename(key, path.extname(key)))
                    .map((filePath) => parserMap.get(path.extname(filePath))(filePath))
                    .toObject();
            }
        }
        assert(config instanceof Object, 'Config must be an object or a path to a directory');
        this.config = extend(true, this.config, config);
        return this;
    }
    reset() {
        this.config = {};
        return this;
    }
}

module.exports = LarkConfig;
