/**
 * Test for lark-config
 **/
'use strict';
process.mainModule = module;

const assert  = require('assert');
const should  = require('should');
const Config  = require('lark-config');


describe('common use', () => {
    let config = null;

    it('should be ok intializing a config with a directory', async () => {
        config = new Config();
        await config.load('configs');
        config.config.should.be.an.instanceOf(Object);
        config.config.should.containDeep({
            'a': {
                'key-a': 'value-a',
                'key-b': {
                    'key-b-1': 'content-b-1',
                    'key-b-2': 'content-b-2',
                },
                'key-c.key-d': 'value-d',
            },
            'b': {
                'key-b': 'content-b',
                'key-c': {
                    'key-c-1': 'content-c-1',
                    'key-c-2': 'content-c-2',
                },
            },
            'c': {
                'key-c': 'content-c',
                'key-d': {
                    'key-d-1': ['content-d-1.0', 'content-d-1.1'],
                    'key-d-2': { 'content-d-2': null },
                },
            },
            'd': {
                'e': {
                    'key-e': 'content-e',
                }
            },
            'f': {
                'f': 'value-f',
            },
        });
        config.config.g.should.be.an.instanceOf(Function);
        config.config.g().should.be.exactly('How are you');
    });

    it('should return the right value using get()', async () => {
        config.get('a').should.containDeep({
            'key-a': 'value-a',
            'key-b': {
                'key-b-1': 'content-b-1',
                'key-b-2': 'content-b-2',
            },
            'key-c.key-d':  'value-d',
        });
        config.get('b.key-b').should.be.exactly('content-b');
    });

    it('should return a config with getConfig()', async () => {
        const b_config = config.getConfig('b');
        b_config.should.be.an.instanceOf(Config);
        b_config.get('key-c.key-c-2').should.be.exactly('content-c-2');
        const c_config = config.getConfig('b.key-c.key-c-2');
        c_config.should.be.exactly('content-c-2');
    });

    it('should return undefined if getting an none-existing value', async () => {
        should(config.get('a.no-exists.no-exists')).be.exactly(undefined);
    });

    it('should return true if getting an existing value', async () => {
        should(config.has('a')).be.ok;
    });

    it('should return false if getting an none-existing value', async () => {
        should(config.has('no-exist')).be.not.ok;
    });

    it('should set the right value', async () => {
        config.set('a.b', 'a-b');
        config.config.a.b.should.be.exactly('a-b');
    });

    it('should set the right value with another config', async () => {
        const another = new Config().use({ a: { c: 'CC' }});
        config.set('aa', another);
        config.config.aa.should.containDeep({ a: { c: 'CC' }});
    });

    it('should merge by using another config', async () => {
        const another = new Config().use({ a: { c: 'CC' }});
        config.use(another);
        config.config.should.containDeep({ a: { c: 'CC' }});
    });

    it('should delete the config by calling delete', async () => {
        config.delete('a.b');
        config.config.a.should.not.have.ownProperty('b');
    });

});


describe('loading config with customized parser', () => {

    it('should be ok for ".conf" with yaml parser', async () => {
        const config = new Config();
        config.setFileLoader('conf', Config.LOAD_YAML);
        await config.load('conf/c.conf');
        config.config.should.containDeep({
            name: {
                field1: 'value1',
                field2: ['value2', 'value3'],
            }
        });
    });

    describe('should be ok switching config with tags', () => {

        it('should be ok without tags', async () => {
            const config = new Config();
            await config.use('conf/l.json');
            config.config.should.containDeep({
                "server": {
                    "host": "110.110.110.110",
                    "port": "8888",
                }
            });
        });

        it('should be ok with a suffix tag "@test"', async () => {
            const config = new Config();
            await config.load('conf/l.json', '@test');
            config.config.should.containDeep({
                "server": {
                    "host": "127.0.0.1",
                    "port": "8888",
                }
            });
        });

        it('should be ok with a regular expression tag /:test$/', async () => {
            const config = new Config();
            await config.load('conf/l.json', [/\:test$/]);
            config.config.should.containDeep({
                "server": {
                    "host": "192.168.0.2",
                    "port": "8800",
                }
            });
        });
        
    });

    it('should be ok loading files with dot in name', async () => {
        const config = new Config();
        await config.load('conf');
        config.set('a\\.c\\.d.hello', 'world');
        config.config.should.containDeep({
            "a.b": {
                "d": {
                    "message": "hello",
                }
            },
            "a.b.c": {
                "d": "D",
            },
            "a.c.d": {
                "hello": "world",
            },
        });
        config.get('a\\.b.d.message').should.be.exactly('hello');
    });

    it('should be ok loading files with another sep', async () => {
        const config = new Config({ sep: '/' });
        await config.load('conf');
        config.config.should.containDeep({
            'a.b': {
                'd': {
                    'message': 'hello',
                }
            },
            'a.b.c': {
                'd': 'D',
            }
        });
        config.get('a.b/d/message').should.be.exactly('hello');
    });
});
