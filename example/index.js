/**
 * Example of lark-config
 **/
process.mainModule = module;

const Config  = require('lark-config');

async function main() {
    const config = new Config();
    await config.use('configs');
    return config;
}

module.exports = main;
