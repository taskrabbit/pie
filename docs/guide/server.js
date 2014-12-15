/* global __dirname */
var fs = require("fs");
var host = "127.0.0.1";
var port = 8081;
var express = require("express");

var app = express();

app.get(/^\/(css|js|pages)\//, function(request, response) {
  response.sendFile(__dirname + request.path);
});

app.get('*', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});


app.listen(port, host);
console.log("Serving guide on: " + host + ":" + port);
