/**
 * lark-config - index.js
 * Copyright(c) 2014 larkjs-team(https://github.com/larkjs)
 * MIT Licensed
 */

'use strict';

var config = require('..');

var expect = {
  environment: 'development',
  port: 3000,
  views: {engine: 'handlebars', layout: 'layouts'}
};

describe('config', function () {
  it('configs should equal expect"', function (done) {
    var configs = config({
      directory: "example/config"
    });
    JSON.stringify(configs).should.equal(JSON.stringify(expect));
    done();
  });
});
