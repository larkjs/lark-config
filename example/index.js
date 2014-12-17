/**
 * Created by mdemo on 14/12/8.
 */
var config = require('..');
var koa = require('koa');
var app = koa();

app.use(config(app,{
  directory: "example/configs"
}));


// response

app.use(function *(){
  this.body = this.configs;
});

app.listen(app.configs.port);

