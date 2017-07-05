/**
 * Load configs from directories
 **/
'use strict';

const assert    = require('assert');
const bluebird  = require('bluebird');
const extend    = require('extend');
const fs        = require('fs');
const misc      = require('vi-misc');
const path      = require('path');
const yaml      = require('js-yaml');
const Directory = require('directoryfiles');

bluebird.promisifyAll(fs);

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
    ['.yaml', readYaml],
    ['.yml',  readYaml]
]);

class LarkConfig {
    constructor() {
        this.config = {};
    }
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
