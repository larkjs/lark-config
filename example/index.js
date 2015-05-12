/**
 * Created by mdemo on 14/12/8.
 */
//To work around mocha
//Main module is supposed to be this file
process.mainModule = module;

var config = require('..');

var configs = config({
  directory: "example/config"
});
console.log(configs);
