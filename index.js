/**
 * Lark Config, a config loader and parser
 **/
'use strict';

const assert      = require('assert');
const debug       = require('debug')('lark-config');
const fs          = require('fs');
const misc        = require('vi-misc');
const path        = require('path');
const parse_json  = require('parse-json');
const yaml        = require('js-yaml');
const Descriptor  = require('directoryfiles');
misc.async.all(fs);


class LarkConfig {

    static get LOAD_MODULE() { return load_module; }
    static get LOAD_JSON() { return load_json; }
    static get LOAD_YAML() { return load_yaml; }

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
    use(object, tags = []) {
        debug('use object');
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
    async load(descriptor_path, tags) {
        assert('string' === typeof descriptor_path, 'Descriptor path must be a string');
        debug(`loading [${descriptor_path}]`);
        const descriptor = new Descriptor(descriptor_path);
        await descriptor.ready();
        const object = await this._parse(descriptor.tree);
        return this.use(object, tags);
    }

    /**
     * Get the config value by key_chain
     **/
    get(key_chain) {
        const sep = this.options.sep;
        return misc.object.getByKeys(this.config, ...(misc.path.split(key_chain, sep)));
    }

    /**
     * Get the config by key_chain
     **/
    getConfig(key_chain) {
        const value = this.get(key_chain);
        return value instanceof Object ? new LarkConfig().use(value) : value;
    }

    /**
     * Set the config value by key_chain
     **/
    set(key_chain, value) {
        const sep = this.options.sep;
        value = value instanceof LarkConfig ? value.config : value;
        misc.object.setByKeys(this.config, value, ...(misc.path.split(key_chain, sep)));
        return this;
    }

    /**
     * Check if a config is set
     **/
    has(key_chain) {
        const sep = this.options.sep;
        return misc.object.hasByKeys(this.config, ...(misc.path.split(key_chain, sep)));
    }

    /**
     * Delete a config by key_chain
     **/
    delete(key_chain) {
        const sep = this.options.sep;
        misc.object.removeByKeys(this.config, ...(misc.path.split(key_chain, sep)));
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
            const key = path.basename(name, path.extname(name));
            result[key] = await this._parse(target[name]);
        }
        return result;
    }

    /**
     * Load file
     **/
    async _loadFile(file_path) {
        const extname = path.extname(file_path).slice(1).toLowerCase();
        if (!(this.fileLoaders[extname] instanceof Function)) {
            return null;
        }
        return await this.fileLoaders[extname](file_path);
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
        const detag_keys = get_detag_keys(keys, tags);
        if (Array.isArray(detag_keys) && detag_keys.length > 0) {
            overwrites.add({ detag_keys, value, keys });
        }
    }
    for (const { detag_keys, value, keys } of overwrites.values()) {
        debug(`overwriting ${detag_keys} with ${keys}`);
        misc.object.setByKeys(result, value, ...detag_keys);
    }
    return result;
}


function get_detag_keys(keys, tags) {
    let detag =  false;
    keys = keys.map(key => {
        let detag_key = key;
        for (const tag of tags) {
            detag_key =
                (tag instanceof RegExp && detag_key.match(tag)) ? detag_key = detag_key.replace(tag, '') :
                ('string' === typeof tag && detag_key.endsWith(tag)) ? detag_key = detag_key.slice(0, - tag.length) :
                detag_key;
        }
        detag = detag || (key !== detag_key);
        return detag_key;
    });
    return detag ? keys : false;
}


async function load_yaml(file_path) {
    const rel_path = path.relative(misc.path.root, file_path);
    debug(`load yaml [${rel_path}]`);
    const content = await fs.readFileAsync(file_path);
    const object = yaml.safeLoad(content);
    return object;
}


async function load_module(file_path) {
    const rel_path = path.relative(misc.path.root, file_path);
    debug(`load module [${rel_path}]`);
    return require(file_path);
}


async function load_json(file_path) {
    const rel_path = path.relative(misc.path.root, file_path);
    debug(`load json [${rel_path}]`);
    const content = await fs.readFileAsync(file_path);
    const object = parse_json(content);
    return object;
}

module.exports = LarkConfig;
