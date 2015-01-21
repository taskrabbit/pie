/* global __dirname */

var fs = require('fs');

var injectionContent = fs.readFileSync(__dirname + '/docco-index.html', {encoding: 'utf8'});
var docs = fs.readFileSync(__dirname + '/annotated/pie.html', {encoding: 'utf8'});

var idx = docs.lastIndexOf('</body>');
var content = docs.substring(0, idx) + injectionContent + docs.substring(idx);

fs.writeFile(__dirname + '/annotated/pie.html', content);
