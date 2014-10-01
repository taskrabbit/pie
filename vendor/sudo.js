(function(window) {
    // #Sudo Namespace
    var sudo = {
        // ###getPath
        // Extract a value located at `path` relative to the passed in object
        //
        // `param` {String} `path`. The key in the form of a dot-delimited path.
        // `param` {object} `obj`. An object literal to operate on.
        //
        // `returns` {*|undefined}. The value at keypath or undefined if not found.
        getPath: function getPath(path, obj) {
            var key, p;
            p = path.split('.');
            for (key; p.length && (key = p.shift());) {
                if (!p.length) return obj[key];
                else obj = obj[key] || {};
            }
            return obj;
        },
        // ###setPath
        // Traverse the keypath and get each object
        // (or make blank ones) eventually setting the value
        // at the end of the path
        //
        // `param` {string} `path`. The path to traverse when setting a value.
        // `param` {*} `value`. What to set.
        // `param` {Object} `obj`. The object literal to operate on.
        setPath: function setPath(path, value, obj) {
            var p = path.split('.'),
                key;
            for (key; p.length && (key = p.shift());) {
                if (!p.length) obj[key] = value;
                else if (obj[key]) obj = obj[key];
                else obj = obj[key] = {};
            }
        }
    };

    // ###Templating

    // Allow the default {{ js code }}, {{= key }}, and {{- escape stuff }}
    // micro templating delimiters to be overridden if desired
    //
    // `type` {Object}
    sudo.templateSettings = {
        evaluate: /\{\{([\s\S]+?)\}\}/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
        escape: /\{\{-([\s\S]+?)\}\}/g
    };
    // Certain characters need to be escaped so that they can be put
    // into a string literal when templating.
    //
    // `type` {Object}
    sudo.escapes = {};
    (function(s) {
        var e = {
            '\\': '\\',
            "'": "'",
            r: '\r',
            n: '\n',
            t: '\t',
            u2028: '\u2028',
            u2029: '\u2029'
        };
        for (var key in e)
            if (e.hasOwnProperty(key)) s.escapes[e[key]] = key;
    }(sudo));
    // lookup hash for `escape`
    //
    // `type` {Object}
    sudo.htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    // Escapes certain characters for templating
    //
    // `type` {regexp}
    sudo.escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    // Escape unsafe HTML
    //
    // `type` {regexp}
    sudo.htmlEscaper = /[&<>"'\/]/g;
    // Unescapes certain characters for templating
    //
    // `type` {regexp}
    sudo.unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
    // ###escape
    // Remove unsafe characters from a string
    //
    // `param` {String} str
    sudo.escape = function(str) {
        if('string' !== typeof str) return str;
        return str.replace(sudo.htmlEscaper, function(match) {
            return sudo.htmlEscapes[match];
        });
    };
    // ###unescape
    // Within an interpolation, evaluation, or escaping,
    // remove HTML escaping that had been previously added.
    //
    // `param` {string} str
    sudo.unescape = function unescape(str) {
        return str.replace(sudo.unescaper, function(match, escape) {
            return sudo.escapes[escape];
        });
    };
    // ###template
    // JavaScript micro-templating, similar to John Resig's (and it's offspring) implementation.
    // sudo templating preserves whitespace, and correctly escapes quotes within interpolated code.
    // Unlike others sudo.template requires a scope name (to avoid the use of `with`) and will spit at you
    // if it is not present.
    //
    // `param` {string} `str`. The 'templated' string.
    // `param` {Object} `data`. Optional hash of key:value pairs.
    // `param` {string} `scope`. Optional context name of your `data object`, set to 'data' if falsy.
    sudo.template = function template(str, data, scope) {
        scope || (scope = 'data');
        var settings = sudo.templateSettings,
            render, tmpl,
            // Compile the template source, taking care to escape characters that
            // cannot be included in a string literal and then unescape them in code blocks.
            source = "_p+='" + str.replace(sudo.escaper, function(match) {
                return '\\' + sudo.escapes[match];
            }).replace(settings.escape, function(match, code) {
                return "'+\n((_t=(" + sudo.unescape(code) + "))==null?'':sudo.escape(_t))+\n'";
            }).replace(settings.interpolate, function(match, code) {
                return "'+\n((_t=(" + sudo.unescape(code) + "))==null?'':_t)+\n'";
            }).replace(settings.evaluate, function(match, code) {
                return "';\n" + sudo.unescape(code) + "\n_p+='";
            }) + "';\n";
        source = "var _t,_p='';" + source + "return _p;\n";
        render = new Function(scope, source);
        if (data) return render(data);
        tmpl = function(data) {
            return render.call(this, data);
        };
        // Provide the compiled function source as a convenience for reflection/compilation
        tmpl.source = 'function(' + scope + '){\n' + source + '}';
        return tmpl;
    };

    sudo.version = "0.9.9.partial";
    window.sudo = sudo;
}).call(this, this);
