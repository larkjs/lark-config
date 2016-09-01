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

describe('config', () => {

    it('should throw if file is not exist', done => {
        let error = {};
        try {
            config('../example/faked_configs_path');
        }
        catch (e) {
            error = e;
        }
        error.should.be.an.instanceOf(Error);
        done();
    });
});
