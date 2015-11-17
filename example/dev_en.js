/**
 * Example of lark-config
 **/
import config   from '..';
import _debug   from 'debug';
const debug     = _debug('lark-config');

debug('Example: set app.js as the main module');
process.mainModule = module;

debug('Example: loading configs');
let configs = config('configs', {
    env: 'development',
    locale: 'en',
});

debug('Example: print configs');
console.log(configs);
