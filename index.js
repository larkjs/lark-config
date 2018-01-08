/**
 * Lark Config, provides an easy way to access and manipulate configs from object/files
 *
 * @copyright - ALL RIGHTS RESERVED lark.js team
 **/
'use strict';

const assert      = require('assert');
const debug       = require('debug')('lark-config');
const fs          = require('fs');
const misc        = require('vi-misc');
const path        = require('path');
const parseJson   = require('parse-json');
const yaml        = require('js-yaml');
const Descriptor  = require('directoryfiles');
misc.async.all(fs);


class LarkConfig {

    static get LOAD_MODULE() { return loadModule; }
    static get LOAD_JSON() { return loadJson; }
    static get LOAD_YAML() { return loadYaml; }

    constructor(options = {}) {
        debug('construct');
        assert(options instanceof Object, 'Options must be an object');
        this.config = {};
        this.options = misc.object.clone(options);
        this.options.sep = this.options.sep || '.';
        this.fileLoaders = {
            node: LarkConfig.LOAD_MODULE,
            js: LarkConfig.LOAD_MODULE,
            json: LarkConfig.LOAD_JSON,
            yaml: LarkConfig.LOAD_YAML,
            yml: LarkConfig.LOAD_YAML,
        };
    }

    /**
     * Use object configs
     * @param   {array}   tags    Config filter tags. If config key matches `{name}.{tag}`, it
     *                            will be used to replace the config for `{name}`
     **/
    use(target, tags = []) {
        if ('string' === typeof target) {
            return this.load(target, tags);
        }
        debug('use object');
        let object = target;
        assert(object instanceof Object, 'Using an invalid config');
        if (object instanceof LarkConfig) {
            object = object.config;
        }
        object = reorganize(object, this.options.sep, tags);
        this.config = misc.object.merge(this.config, object);
        return this;
    }

    /**
     * Load configs from a directory or a file
     **/
    async load(descriptorPath, tags) {
        assert('string' === typeof descriptorPath, 'Descriptor path must be a string');
        debug(`loading [${descriptorPath}]`);
        const descriptor = new Descriptor(descriptorPath);
        await descriptor.ready();
        const object = await this._parse(descriptor.tree);
        return this.use(object, tags);
    }

    /**
     * Get the config value by keyChain
     **/
    get(keyChain) {
        const sep = this.options.sep;
        return misc.object.clone(misc.object.getByKeys(this.config, ...(misc.path.split(keyChain, sep))));
    }

    /**
     * Get the config by keyChain
     **/
    getConfig(keyChain) {
        const value = this.get(keyChain);
        return value instanceof Object ? new LarkConfig().use(value) : value;
    }

    /**
     * Set the config value by keyChain
     **/
    set(keyChain, value) {
        const sep = this.options.sep;
        value = value instanceof LarkConfig ? value.config : value;
        misc.object.setByKeys(this.config, value, ...(misc.path.split(keyChain, sep)));
        return this;
    }

    /**
     * Check if a config is set
     **/
    has(keyChain) {
        const sep = this.options.sep;
        return misc.object.hasByKeys(this.config, ...(misc.path.split(keyChain, sep)));
    }

    /**
     * Delete a config by keyChain
     **/
    delete(keyChain) {
        const sep = this.options.sep;
        misc.object.removeByKeys(this.config, ...(misc.path.split(keyChain, sep)));
        return this;
    }

    /**
     * Set the file loader
     **/
    setFileLoader(extname, loader) {
        assert('string' === typeof extname, 'Extname must be a string');
        assert(loader instanceof Function, 'Parser must be a function');
        debug(`set file loader for ${extname}`);
        this.fileLoaders[extname] = loader;
        return this;
    }

    /**
     * Parse the file
     **/
    async _parse(target) {
        if ('string' === typeof target) {
            return await this._loadFile(target);
        }
        assert(target instanceof Object, 'Invalid type of target');
        const result = {};
        for (let name in target) {
            let key = target[name] instanceof Object ? name : path.basename(name, path.extname(name));
            result[key] = await this._parse(target[name]);
        }
        return result;
    }

    /**
     * Load file
     **/
    async _loadFile(filePath) {
        const extname = path.extname(filePath).slice(1).toLowerCase();
        if (!(this.fileLoaders[extname] instanceof Function)) {
            return null;
        }
        return await this.fileLoaders[extname](filePath);
    }

}


function reorganize(object, sep, tags) {
    if (!(object instanceof Object) || object instanceof Function) {
        return object;
    }
    debug('reorganize');
    if (!Array.isArray(tags)) {
        tags = [tags];
    }
    tags = tags.filter(tag => ('string' === typeof tag && '' !== tag.trim()) || tag instanceof RegExp);
    const result = Array.isArray(object) ? [] : {};
    const overwrites = new Set();
    for (const name in object) {
        const value = reorganize(object[name], sep, tags);
        const keys = misc.path.split(name, sep);
        debug(`setting ${keys}`);
        misc.object.setByKeys(result, value, ...keys);
        const detagKeys = getDetagKeys(keys, tags);
        if (Array.isArray(detagKeys) && detagKeys.length > 0) {
            overwrites.add({ detagKeys, value, keys });
        }
    }
    for (const { detagKeys, value, keys } of overwrites.values()) {
        debug(`overwriting ${detagKeys} with ${keys}`);
        misc.object.setByKeys(result, value, ...detagKeys);
    }
    return result;
}


function getDetagKeys(keys, tags) {
    let detag =  false;
    keys = keys.map(key => {
        let detagKey = key;
        for (const tag of tags) {
            detagKey =
                (tag instanceof RegExp && detagKey.match(tag)) ? detagKey = detagKey.replace(tag, '') :
                ('string' === typeof tag && detagKey.endsWith(tag)) ? detagKey = detagKey.slice(0, - tag.length) :
                detagKey;
        }
        detag = detag || (key !== detagKey);
        return detagKey;
    });
    return detag ? keys : false;
}


async function loadYaml(filePath) {
    const relPath = path.relative(misc.path.root, filePath);
    debug(`load yaml [${relPath}]`);
    const content = await fs.readFileAsync(filePath);
    const object = yaml.safeLoad(content);
    return object;
}


async function loadModule(filePath) {
    const relPath = path.relative(misc.path.root, filePath);
    debug(`load module [${relPath}]`);
    return require(filePath);
}


async function loadJson(filePath) {
    const relPath = path.relative(misc.path.root, filePath);
    debug(`load json [${relPath}]`);
    const content = await fs.readFileAsync(filePath);
    const object = parseJson(content);
    return object;
}

module.exports = LarkConfig;
