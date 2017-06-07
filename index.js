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

function readYaml(filepath) {
    return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
}

function requireClone(filepath) {
    let module = require(filepath);
    if ('object' === typeof module) {
        module = extend({}, module, true);
    }
    return module;
}

const parsers = new Map([
    ['.js',   requireClone],
    ['.json', requireClone],
    ['.yaml', readYaml],
    ['.yml',  readYaml]
]);

class LarkConfig {
    constructor(config = {}) {
        this.config = {};
        this.use(config);
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
        if ('string' === typeof config) {
            const target = misc.path.absolute(config);
            if (fs.statSync(target).isFile()) {
                config = parsers.get(path.extname(target))(target);
            }
            else {
                const directory = new Directory(target);
                config = directory.filter(filepath => parsers.has(path.extname(filepath)))
                    .mapkeys(key => path.basename(key, path.extname(key)))
                    .map((filepath) => parsers.get(path.extname(filepath))(filepath))
                    .toObject();
            }
        }
        assert(config instanceof Object, 'Config must be an object or a path to a directory');
        this.config = extend(this.config, config, true);
        return this;
    }
    async useAsync(config = {}) {
        if ('string' === typeof config) {
            const target = misc.path.absolute(config);
            let stats = await new Promise((resolve, reject) => {
                fs.stat(target, (error, stats) => error ? reject(error) : resolve(stats));
            });
            if (stats.isFile()) {
                config = parsers.get(path.extname(target))(target);
            }
            else {
                const directory = new Directory(target, true);
                await directory.load();
                config = directory.filter(filepath => parsers.has(path.extname(filepath)))
                    .mapkeys(key => path.basename(key, path.extname(key)))
                    .map((filepath) => parsers.get(path.extname(filepath))(filepath))
                    .toObject();
            }
        }
        assert(config instanceof Object, 'Config must be an object or a path to a directory');
        this.config = extend(this.config, config, true);
        return this;
    }
    reset() {
        this.config = {};
        return this;
    }
}

module.exports = LarkConfig;
