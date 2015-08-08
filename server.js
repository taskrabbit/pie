/* global __dirname, process */

var fs = require("fs");
var glob = require('glob');
var express = require("express");

var port = process.env.PORT || 5000;
var app = express();

app.get(/^\/docs\/guide\/(css|js|pages|images)\//, function(request, response) {
  response.sendFile(__dirname + request.path);
});

app.get(/^\/docs\/guide\/*/, function(request, response) {
  response.sendFile(__dirname + '/docs/guide/index.html');
});

app.get('/examples/navigation.html', function(request, response) {
  response.redirect(302, '/examples/navigation/view-a');
});

app.get(/^\/examples\/navigation.*/, function(request, response) {
  response.sendFile(__dirname + '/examples/navigation.html');
});

app.get("/examples/transitions.html", function(request, response) {
  response.redirect(302, '/examples/transitions/a.html');
});

app.get(/^\/examples\/transitions\/(a|b|c|d)\.html/, function(request, response) {
  response.sendFile(__dirname + '/examples/transitions.html');
});

app.get(/\/specRunner(\.html)?/, function(request, response) {
  var content = fs.readFileSync(__dirname + '/specRunner.html', {encoding: 'utf8'});

  var sources = fs.readFileSync(__dirname + '/sources.txt', {encoding: 'utf8'}).split("\n")[0].split(" ");
  sources = sources.map(function(src){ return __dirname + '/' + src; });
  var srcs = [];

  sources.forEach(function(source){
    srcs = srcs.concat(glob.sync(source));
  });

  srcs = srcs.map(function(src){
    return '<script src="/src/' + src.split('/src/')[1] + '"></script>';
  }).join("\n");

  content = content.replace('<!-- include source files here... -->', srcs);

  var specs = glob.sync(__dirname + '/spec/**/*Spec.js');
  specs = "<script src=\"/spec/specHelper.js\"></script>\n" + specs.map(function(spec){
    return '<script src="/spec/' + spec.split('/spec/')[1] + '"></script>';
  }).join("\n");

  content = content.replace('<!-- include spec files here... -->', specs);

  response.send(content);
});

app.get('/', function(req, res) {
  res.redirect(301, '/docs/guide');
});

app.get('*', function(req, res) {
  res.sendFile(__dirname + req.path);
});


app.listen(port);
console.log("Serving delicious pie on port " + port);
