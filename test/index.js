/**
 * lark-config - index.js
 * Copyright(c) 2014 larkjs-team(https://github.com/larkjs)
 * MIT Licensed
 */

'use strict';

//To work around mocha test
process.mainModule = module;

var config = require('..');

var expect = {
  port: 3000,
  mvc: { path: 'models' },
  travis: { language: 'node_js', node_js: [ '0.11.13', '0.11.14' ] },
  views: { engine: 'handlebars', layout: 'layouts' },
  environment: 'development',
};

describe('config', function () {
  it('should equal expect"', function (done) {
    var configs = config({
      directory: "../example/config"
    });
    delete configs.configPath;
    JSON.stringify(configs).should.equal(JSON.stringify(expect));
    done();
  });
});
