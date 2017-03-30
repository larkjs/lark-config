/**
 * Load configs from directories
 **/
'use strict';

const assert    = require('assert');
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
    constructor(configDirPath) {
        assert('string' === typeof configDirPath, 'Param path should be a string');
        this.path = misc.path.absolute(configDirPath);
        const directory = new Directory(configDirPath);
        this.config = directory.filter(filepath => parsers.has(path.extname(filepath)))
                               .mapkeys(key => path.basename(key, path.extname(key)))
                               .map(filepath => parsers.get(path.extname(filepath))(filepath))
                               .toObject();
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
    set(name, value) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        let lastKey = names.pop();
        for (let key of names) {
            assert(pointer.hasOwnProperty(key), 'Invalid name, no such a config path');
            pointer = pointer[key];
        }
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
    remove(name) {
        assert('string' === typeof name, 'Invalid name, should be a string');
        const names = misc.path.split(name);
        let pointer = this.config;
        let lastKey = names.pop();
        for (let key of names) {
            assert(pointer.hasOwnProperty(key), 'Invalid name, no such a config path');
            pointer = pointer[key];
        }
        delete pointer[lastKey];
        return this;
    }
}

module.exports = LarkConfig;
