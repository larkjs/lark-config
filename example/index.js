/**
 * Example of lark-config
 **/
process.mainModule = module;

const Config  = require('..');

const config = new Config('configs');

module.exports = config;
