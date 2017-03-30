/**
 * Test of lark config
 **/
'use strict';

const LarkConfig = require('..');

const config = require('../example');

describe('config loaded from directory', () => {
    it('should be an object with configs', (done) => {
        config.should.be.an.instanceof(LarkConfig);
        config.should.have.property('path');
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
});
