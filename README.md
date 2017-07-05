lark-config
===============

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

This is a tool to load configs from files

## How to install

```
$ npm install --save lark-config
```

## How to use

```
const config = new Config();
await config.use('configs');
```

This will load all files (.js, .json, .yaml, .yml) in directory 'configs'.

Then you can easily get/check/remove a config by path:

```
config.get("path/to/file/foo/bar");       // nearly same as require('path/to/file').foo.bar
config.has("path/to/file/foo/bar");
config.remove("path/to/file/foo/bar");
```


[npm-image]: https://img.shields.io/npm/v/lark-config.svg?style=flat-square
[npm-url]: https://npmjs.org/package/lark-config
[travis-image]: https://img.shields.io/travis/larkjs/lark-config/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/larkjs/lark-config
[coveralls-image]: https://img.shields.io/codecov/c/github/larkjs/lark-config.svg?style=flat-square
[coveralls-url]: https://codecov.io/github/larkjs/lark-config?branch=master
