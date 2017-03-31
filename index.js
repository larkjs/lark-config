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

const parsers = new Map([
    ['.js',   require],
    ['.json', require],
    ['.yaml', readYaml],
    ['.yml',  readYaml]
]);

function readYaml(filepath) {
    return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
}

class LarkConfig {
    constructor(config = {}) {
        if ('string' === typeof config) {
            const directory = new Directory(config);
            this.config = directory.filter(filepath => parsers.has(path.extname(filepath)))
                                   .mapkeys(key => path.basename(key, path.extname(key)))
                                   .map(filepath => parsers.get(path.extname(filepath))(filepath))
                                   .toObject();
        }
        else {
            assert(config instanceof Object, 'Config must be an object or a path to a directory');
            this.config = extend({}, config, true);
        }
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
    use(config = {}) {
        config = new LarkConfig(config);
        config = extend({}, config.config, true);
        this.config = extend(this.config, config, true);
        return this;
    }
    reset() {
        this.config = {};
        return this;
    }
}

module.exports = LarkConfig;
