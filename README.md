lark-config
===============

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

This is a tool to load configs from files

## How to install

```
$ npm install --save lark-config
```

## How to use

We supposed you've written some configs in some files under a diretory `configs`
```
// system.json
{
    "port": 3000,
    "env": "development",
}

// log.json
{
    "level": 3,
    ...
}
```

Then load all this files in configs like this:
```
const loadConfig = requrie('lark-config');

const myConfigs = loadConfig('./configs');

/* myConfigs will be
{
    system: {
        port: 3000,
        env: "development"
    },
    log: {
        level: 3
    },
    configPath: 'configs'
}
*/

```

If you want to switch configs with env, you can use `optiosn` as the 2nd param
```
const myConfigs = loadConfig('./configs', {
    env: 'production'
});
```
In this case, you should make a directory `env` with some files named just as the candidate values, like:
```
// env/production.json
{
    system: {
        port: 80,
        env: "production"
    }
}
```


[npm-image]: https://img.shields.io/npm/v/lark-config.svg?style=flat-square
[npm-url]: https://npmjs.org/package/lark-config
[travis-image]: https://img.shields.io/travis/larkjs/lark-config/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/larkjs/lark-config
