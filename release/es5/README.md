lark-config
===============

config module for lark.js

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

## useage
```
var config = require('..');

var configs = config('config');

```

假设放配置的目录是 config, 对于config/a.js, 里面的配置会映射到configs.a里。举例如下:
有一个配置文件内容如下:

```
exports = {
    'port': 123
}

```

在不同文件中映射的结果如下:

```
    config/test.js ==> app.configs.test.port = 123
    config/redis.js ==> app.configs.redis.port = 123

```

config 支持不同参数加载不同配置。比如有env参数，可以是 'production' 和 'development' 两个环境，对应线上和线下环境。那么可以进行如下配置:

在 config 目录下新建 env 文件夹,里面建立 production.js 和 development.js两个文件

```
config/env/production.js  ==> 里面放线上生产环境的配置
config/env/development.js ==> 里面放线下开发环境的配置
```

通过如下方式加在对应环境的配置：

```
    var configs = config('config', { env: process.env.NODE_ENV });
```


[npm-image]: https://img.shields.io/npm/v/lark-config.svg?style=flat-square
[npm-url]: https://npmjs.org/package/lark-config
[travis-image]: https://img.shields.io/travis/larkjs/lark-config/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/larkjs/lark-config
