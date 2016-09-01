/**
 * lark-config - index.js
 * Copyright(c) 2014 larkjs-team(https://github.com/larkjs)
 * MIT Licensed
 */
'use strict';

var _ = require('..');

var _2 = _interopRequireDefault(_);

var _deepEql = require('deep-eql');

var _deepEql2 = _interopRequireDefault(_deepEql);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.mainModule = module;

const expect_base = {
    a: {
        'key-a': 'value-a',
        'key-b': {
            'key-b-1': 'content-b-1',
            'key-b-2': 'content-b-1'
        }
    },
    b: {
        'key-b': 'content-b',
        'key-c': {
            'key-c-1': 'content-c-1',
            'key-c-2': 'content-c-2'
        }
    },
    c: {
        'key-c': 'content-c',
        'key-d': {
            'key-d-1': ['content-d-1.0', 'content-d-1.1'],
            'key-d-2': {
                'content-d-2': null
            }
        }
    },
    d: {
        e: {
            'key-e': 'content-e'
        }
    }
};

const expect_dev_en = (0, _extend2.default)(true, (0, _extend2.default)(true, {}, expect_base), {
    f: "value-f-dev",
    locales: {
        "welcome": "welcome",
        ":)": ":)"
    }
});

const expect_prod_zhCN = (0, _extend2.default)(true, (0, _extend2.default)(true, {}, expect_base), {
    f: "value-f-prod",
    locales: {
        "welcome": "欢迎",
        ":)": "^_^"
    }
});

describe('config', function () {
    it('should equal expect with env dev and locale en', function (done) {
        let configs = (0, _2.default)('../example/configs', {
            env: 'development',
            locale: 'en'
        });
        delete configs.configPath;
        (0, _deepEql2.default)(configs, expect_dev_en).should.be.exactly(true);
        done();
    });

    it('should equal expect with env prod and locale zhCN', function (done) {
        let configs = (0, _2.default)('../example/configs', {
            env: 'production',
            locale: 'zhCN'
        });
        delete configs.configPath;
        (0, _deepEql2.default)(configs, expect_prod_zhCN).should.be.exactly(true);
        done();
    });
});