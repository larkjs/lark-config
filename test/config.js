/**
 * lark-config - test/index.js
 * Copyright(c) 2014 larkjs-team(https://github.com/larkjs)
 * MIT Licensed
 */
'use strict';

const config = require('..');
const eql    = require('deep-eql');
const extend = require('extend');
const should = require('should');

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
            'key-d-1': [ 
                'content-d-1.0', 'content-d-1.1'
            ],
            'key-d-2': {
                'content-d-2': null 
            }
        }
    },
    d: {
        e: {
            'key-e': 'content-e'
        }
    },
};

const expect_dev_en = extend(true, extend(true, {}, expect_base), {
    f : "value-f-dev",
    locales : {
        "welcome": "welcome",
        ":)": ":)",
    },
});

const expect_prod_zhCN = extend(true, extend(true, {}, expect_base), {
    f : "value-f-prod",
    locales : {
        "welcome": "欢迎",
        ":)": "^_^",
    },
});

describe('config', () => {
    it('should equal expect with env dev and locale en', done => {
        let configs = config('../example/configs', {
            env: 'development',
            locale: 'en',
        });
        delete configs.configPath;
        eql(configs, expect_dev_en).should.be.exactly(true);
        done();
    });

    it('should equal expect with env prod and locale zhCN', done => {
        let configs = config('../example/configs', {
            env: 'production',
            locale: 'zhCN',
        });
        delete configs.configPath;
        eql(configs, expect_prod_zhCN).should.be.exactly(true);
        done();
    });

    it('should equal using object as config', done => {
        let configs = config({
            a: 'a',
            b: 'b',
            caseA: {
                lower: {a: "a"},
                upper: {a: "A"},
            }
        }, {
            caseA: 'upper',
            caseB: 'no use config',
        });
        should(configs.configPath).be.exactly(null);
        delete configs.configPath;

        eql(configs, {a: 'A', b: 'b'}).should.be.exactly(true);
 
        done();
    });
});
