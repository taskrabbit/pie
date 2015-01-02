/* global __dirname, process */

var fs = require("fs");
var port = process.env.PORT || 5000;
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


app.listen(port);
console.log("Serving pie on port " + port);