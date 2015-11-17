'use strict';

var _ = require('..');

var _2 = _interopRequireDefault(_);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Example of lark-config
 **/

const debug = (0, _debug3.default)('lark-config');

debug('Example: set app.js as the main module');
process.mainModule = module;

debug('Example: loading configs');
let configs = (0, _2.default)('configs', {
  env: 'development',
  locale: 'en'
});

debug('Example: print configs');
console.log(configs);