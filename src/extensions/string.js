pie.string.PROTOCOL_TEST = /\w+:\/\//;

pie.string.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};


pie.string.change = function() {
  var args = pie.array.from(arguments),
  str = args.shift();
  args.forEach(function(m) {
    str = pie.string[m](str);
  });

  return str;
};


// deserialize query string into object
pie.string.deserialize = (function(){

  function parseQueryValue(value) {
    if(value === 'undefined') return undefined;
    if(value === 'null') return null;
    if(value === 'true') return true;
    if(value === 'false') return false;
    if(/^-?\d*(\.\d+)?$/.test(value)) {
      var f = parseFloat(value, 10),
          i = parseInt(f, 10);
      if(!isNaN(f) && f % 1) return f;
      if(!isNaN(i)) return i;
    }
    return value;
  }

  // foo[][0][thing]=bar
  // => [{'0' : {thing: 'bar'}}]
  // foo[]=thing&foo[]=bar
  // => {foo: [thing, bar]}
  function applyValue(key, value, params) {
    var pieces = key.split('['),
    segmentRegex = /^\[(.+)?\]$/,
    match, piece, target;

    key = pieces.shift();
    pieces = pieces.map(function(p){ return '[' + p; });

    target = params;

    while(piece = pieces.shift()) {
      match = piece.match(segmentRegex);
      // obj
      if(match[1]) {
        target[key] = target[key] || {};
        target = target[key];
        key = match[1];
      // array
      } else {
        target[key] = target[key] || [];
        target = target[key];
        key = target.length;
      }
    }

    target[key] = value;

    return params;
  }

  return function(str, parse) {
    var params = {}, idx, pieces, segments, key, value;

    if(!str) return params;

    idx = str.indexOf('?');
    if(~idx) str = str.slice(idx+1);

    pieces = str.split('&');
    pieces.forEach(function(piece){
      segments = piece.split('=');
      key = decodeURIComponent(segments[0] || '');
      value = decodeURIComponent(segments[1] || '');

      if(parse) value = parseQueryValue(value);

      applyValue(key, value, params);
    });

    return params;
  };
})();

pie.string.downcase = function(str) {
  return str.toLowerCase();
};

// Escapes a string for HTML interpolation
pie.string.escapeHtml = (function(){
  var encReg = /[<>&"'\x00]/g;
  var encMap = {
    "<"   : "&lt;",
    ">"   : "&gt;",
    "&"   : "&amp;",
    "\""  : "&quot;",
    "'"   : "&#39;"
  };

  return function(str) {
    /* jslint eqnull: true */
    if(str == null) return str;
    return ("" + str).replace(encReg, function(c) { return encMap[c] || ""; });
  };
})();

pie.string.escapeRegex = function(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

pie.string.endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

// designed to be used with the "%{expression}" placeholders
pie.string.expand = function(str, data) {
  data = data || {};
  return str.replace(/\%\{(.+?)\}/g,
    function(match, key) {return data[key];});
};


pie.string.humanize = function(str) {
  return str.replace(/_id$/, '').replace(/([a-z][A-Z]|[a-z]_[a-z])/g, function(match, a){ return a[0] + ' ' + a[a.length-1]; });
};


pie.string.lowerize = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};


pie.string.modularize = function(str) {
  return str.replace(/([^_])_([^_])/g, function(match, a, b){ return a + b.toUpperCase(); });
};

pie.string.normalizeUrl =  function(path) {

  // ensure there's a leading slash
  if(!pie.string.PROTOCOL_TEST.test(path) && path.charAt(0) !== '/') {
    path = '/' + path;
  }

  if(path.indexOf('?') > 0) {
    var split = path.split('?');
    path = pie.string.normalizeUrl(split.shift());
    split.unshift(path);
    path = split.join('?');
  }

  // remove trailing hashtags
  if(path.charAt(path.length - 1) === '#') {
    path = path.substr(0, path.length - 1);
  }

  // remove trailing slashes
  if(path.length > 1 && path.charAt(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1);
  }

  return path;
};

pie.string.pluralize = function(str, count) {
  if(count === 1) return str;
  if(/ss$/i.test(str)) return str + 'es';
  if(/s$/i.test(str)) return str;
  if(/[a-z]$/i.test(str)) return str + 's';
  return str;
};

// todo: i18n
pie.string.possessive = function(str) {
  if(/s$/i.test(str)) return str + "'";
  return str + "'s";
};


pie.string.setTemplateSettings = function(begin, end, escape, interp, evalr, splitter) {
  splitter = splitter || '~~pie-interp~~';
  escape = escape || '-';
  interp = interp || '=';
  evalr = evalr || '';

  var escapedBegin = pie.string.escapeRegex(begin),
  escapedEnd = pie.string.escapeRegex(end),
  escapedEndFirstChar = pie.string.escapeRegex(end[0]),
  escapedInterp = pie.string.escapeRegex(interp),
  escapedEscape = pie.string.escapeRegex(escape),
  escapedEvalr = pie.string.escapeRegex(evalr),
  escapedSplitter = pie.string.escapeRegex(splitter);

  pie.string._templateSettings = {
    begin: begin,
    end: end,
    interp: interp,
    escape: escape,
    splitter: splitter,
    beginRegex:       new RegExp(escapedBegin, 'g'),
    endRegex:         new RegExp(escapedEnd, 'g'),
    interpRegex:      new RegExp(escapedBegin + escapedInterp + '(.+?)' + escapedEnd, 'g'),
    escapeRegex:      new RegExp(escapedBegin + escapedEscape + '(.+?)' + escapedEnd, 'g'),
    evalRegex:        new RegExp(escapedBegin + escapedEvalr + '(.+?)' + escapedEnd, 'g'),
    interpLookahead:  new RegExp("'(?=[^" + escapedEndFirstChar + "]*" + escapedEnd + ")", 'g'),
    splitterRegex:    new RegExp(escapedSplitter, 'g'),
  };
};

pie.string.setTemplateSettings('[%', '%]', '-', '=', '');

//**pie.string.template**
//
// Resig style microtemplating. Preserves whitespace, and only uses string manipulation.
// There is no array construction. Allows an optional variables string `varString` which enables
// custom variable definition inside of the templating function.
//
// ```
// var template = pie.string.template("Hi, [%= data.first_name %]. You have [%= data.count %] [%= pie.string.pluralize('messages', data.count) %].");
// template({first_name: 'John', count: 4});
// //=> "Hi, John. You have 4 messages."
// ```
pie.string.template = function(str, varString) {
  var conf = pie.string._templateSettings,
  strFunc = "var __p='', __s = function(v, e){ return v == null ? '' : (e ? pie.string.escapeHtml(v) : v); };\n" ;
  if(varString) strFunc += varString + ";\n";
  strFunc += "__p += '";

  /**** preserve format by allowing multiline strings. ****/
  strFunc += str.replace(/\n/g, "\\\n")
  /**** EX: "... __p += '[% data.foo = 1 %]text's content[%- data.foo %]more text[%= data['foo'] + 1 %]" ****/

  /**** replace all interpolation single quotes with a unique identifier. ****/
  .replace(conf.interpLookahead, conf.splitter)
  /**** EX: "... __p += '[% data.foo = 1 %]text's content[%- data.foo %]more text[%= data[~~pie-interp~~foo~~pie-interp~~] + 1 %]" ****/

  /**** now replace all quotes with an escaped quote. ****/
  .replace(/'/g, "\\'")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content[%- data.foo %]more text[%= data[~~pie-interp~~foo~~pie-interp~~] + 1 %]" ****/

  /**** and reapply the single quotes in the interpolated content. ****/
  .replace(conf.splitterRegex, "'")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content[%- data.foo %]more text[%= data['foo'] + 1 %]" ****/

  /**** html escape the interpolation ****/
  .replace(conf.escapeRegex, "' + __s($1, true) + '")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content' + __s(data.foo, true) + 'more text[%= data['foo'] + 1 %]" ****/

  /**** interpolate ****/
  .replace(conf.interpRegex, "' + __s($1) + '")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content' + __s(data.foo, true) + 'more text' + __s(data['foo'] + 1) + '" ****/

  /**** evaluation ****/
  .replace(conf.evalRegex, "'; $1; __p+='");
  /**** EX: "... __p +=''; data.foo = 1; __p+='text\'s content' + __s(data.foo, true) + 'more text' + __s(data['foo'] + 1) + '" ****/

  /**** terminate the string ****/
  strFunc += "';";
  /**** EX: "... __p +=''; data.foo = 1; __p+='text\'s content' + __s(data.foo, true) + 'more text' + __s(data['foo'] + 1) + '';" ****/

  /**** final result. ****/
  strFunc += "return __p;";

  return new Function("data", strFunc);
};

pie.string.titleize = function(str) {
  return str.replace(/(^| )([a-z])/g, function(match, a, b){ return a + b.toUpperCase(); });
};

pie.string.pathSteps = function(path) {
  var split = path.split('.'),
  steps = [];

  while(split.length) {
    steps.push(split.join('.'));
    split.pop();
  }

  return steps;
};

pie.string.underscore = function(str) {
  return str.replace(/([a-z])([A-Z])/g, function(match, a, b){ return a + '_' + b.toLowerCase(); }).toLowerCase();
};

pie.string.upcase = function(str) {
  return str.toUpperCase();
};


pie.string.urlConcat = function() {
  var args = pie.array.compact(pie.array.from(arguments), true),
  base = args.shift(),
  query = args.join('&');

  if(!query.length) return base;

  // we always throw a question mark on the end of base
  if(base.indexOf('?') < 0) base += '?';

  // we replace all question marks in the query with &
  if(query.indexOf('?') === 0) query = query.replace('?', '&');
  else if(query.indexOf('&') !== 0) query = '&' + query;

  base += query;
  base = base.replace('?&', '?').replace('&&', '&').replace('??', '?');
  if(base.indexOf('?') === base.length - 1) base = base.substr(0, base.length - 1);
  return base;
};
