/**
 * lark-config - index.js
 * Copyright(c) 2014 larkjs-team(https://github.com/larkjs)
 * MIT Licensed
 */

'use strict';

var config = require('..');
var koa = require('koa');
var request = require('supertest');

var test = {
  "port": 3002,
  "bootstrap": {
    "enable": true,
    "directory": "controllers"
  }
};

var development = {
  "port": 3000,
  "bootstrap": {
    "enable": true,
    "directory": "controllers"
  }
};

var production = {
  "port": 80,
  "bootstrap": {
    "enable": true,
    "directory": "controllers"
  }
};

describe('test', function () {
  it('should return test.json"', function (done) {
    var app = koa();
    app.use(config(app,{directory: "example/configs"}));
    app.use(function * () {
      this.body = this.configs;
    });

    var server = app.listen();

    request(server)
      .get('/')
      .expect(200)
      .expect(test,done);
  });
});

describe('production', function () {
  it('should return production.json"', function (done) {
    var app = koa();
    app.use(config(app, {
      directory: "example/configs",
      env: 'production'
    }));
    app.use(function * () {
      this.body = this.configs;
    });
    var server = app.listen();

    request(server)
      .get('/')
      .expect(200)
      .expect(production,done);
  });
});

describe('development', function () {
  it('should return development.json"', function (done) {
    var app = koa();
    app.use(config(app, {
      directory: "example/configs",
      env: 'development'
    }));
    app.use(function * () {
      this.body = this.configs;
    });


    var server = app.listen();

    request(server)
      .get('/')
      .expect(200)
      .expect(development,done);
  });
});

describe('error', function () {
  it('should return error"', function (done) {
    var app = koa();
    try{
      app.use(config(app, {
        directory: "example/configs",
        env: 'test'
      }));
      app.use(function * () {
        this.body = this.configs;
      });
      var server = app.listen();
    }catch(err){
      err.message.should.equal("test.json doesn't exist");
    }
    done()
  });
});
