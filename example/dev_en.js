/**
 * Example of lark-config
 **/
const config = require('..');
const debug  = require('debug')('lark-config.examples');

debug('set app.js as the main module');
process.mainModule = module;

debug('loading configs');
let configs = config('configs', {
    env: 'development',
    locale: 'en',
});

debug('print configs');
console.log(configs);
