/* global __dirname */
var fs = require("fs");
var host = "127.0.0.1";
var port = 8081;
var express = require("express");

var app = express();

app.get(/^\/docs\/guide\/(css|js|pages)\//, function(request, response) {
  response.sendFile(__dirname + request.path);
});

app.get(/^\/docs\/guide\/*/, function(request, response) {
  response.sendFile(__dirname + '/docs/guide/index.html');
});

app.get('*', function(req, res) {
  res.sendFile(__dirname + req.path);
});


app.listen(port, host);
console.log("Serving pie on: " + host + ":" + port);
