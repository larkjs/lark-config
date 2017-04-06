/**
 * Test of lark config
 **/
'use strict';

const should      = require('should');
const LarkConfig  = require('..');

const config = require('../example');

describe('config initialized with an object', () => {
    it('should return an object with configs', (done) => {
        const oconfig = new LarkConfig(config.config);
        oconfig.get('a').should.have.property('key-a', 'value-a');
        oconfig.get('a/key-a').should.be.exactly('value-a');
        oconfig.get('d').should.have.property('e');
        oconfig.get('d').e.should.have.property('key-e', 'content-e');
        oconfig.get('d/e/key-e').should.be.exactly('content-e');
        done();
    });
});

describe('config initialized with a file', () => {
    it('should return an object with configs', (done) => {
        const fconfig = new LarkConfig();
        fconfig.use();
        fconfig.use('configs/a.json');
        fconfig.get('key-a').should.be.exactly('value-a');
        fconfig.get('key-b').should.be.an.instanceof(Object);
        fconfig.get('key-b/key-b-1').should.be.exactly('content-b-1');
        fconfig.get('key-b/key-b-2').should.be.exactly('content-b-2');
        done();
    });
});

describe('config extended returns correctly values', () => {
    it('should return values in both configs', (done) => {
        const econfig = new LarkConfig(config.config);
        econfig.use({ bbb: 'ccc', a : {'key-a' : 'aaa'}});
        econfig.get('d/e/key-e').should.be.exactly('content-e');
        econfig.get('bbb').should.be.exactly('ccc');
        econfig.get('a/key-a').should.be.exactly('aaa');
        done();
    });
});

describe('config reset will clear all config values', () => {
    it('should clear all values', (done) => {
        const rconfig = new LarkConfig(config.config);
        rconfig.reset();
        Object.keys(rconfig.config).length.should.be.exactly(0);
        done();
    });
});

describe('config loaded from directory', () => {
    it('should be an object with configs', (done) => {
        config.should.be.an.instanceof(LarkConfig);
        config.should.have.property('config');
        config.should.have.property('get');
        config.get.should.be.an.instanceof(Function);
        done();
    });
    it('should return config value as expected', (done) => {
        config.get('a').should.have.property('key-a', 'value-a');
        config.get('a/key-a').should.be.exactly('value-a');
        config.get('d').should.have.property('e');
        config.get('d').e.should.have.property('key-e', 'content-e');
        config.get('d/e/key-e').should.be.exactly('content-e');
        done();
    });
    it('should return modified config after been set', (done) => {
        config.set('a/key-a', 'value-a-modified');
        config.get('a').should.have.property('key-a', 'value-a-modified');
        config.set('a/key/not-exist', 'value-a-new');
        config.get('a/key').should.have.property('not-exist', 'value-a-new');
        done();
    });
    it('should throw error if set an none-existing key, in overwrite mode', (done) => {
        let error = {};
        try {
            config.set('a/key/not-exist-2', 'value', true);
        }
        catch (e) {
            error = e;
        }
        error.should.be.an.instanceof(Error);
        done();
    });
    it('should return modified config after been set', (done) => {
        config.remove('a/key-a');
        config.get('a').should.not.have.property('key-a');
        config.has('a/key-a').should.not.be.ok;
        config.has('not/exist').should.not.be.ok;
        done();
    });
    it('should throw error if removing an none-existing key, in overwrite mode', (done) => {
        let error = {};
        try {
            config.remove('a/key/not-exist-2', true);
        }
        catch (e) {
            error = e;
        }
        error.should.be.an.instanceof(Error);
        error = {};
        try {
            config.remove('a/key/not/exist/2', true);
        }
        catch (e) {
            error = e;
        }
        error.should.be.an.instanceof(Error);
        error = {};
        try {
            config.remove('a/key/not/exist/2');
        }
        catch (e) {
            error = e;
        }
        error.should.not.be.an.instanceof(Error);
        done();
    });
});
