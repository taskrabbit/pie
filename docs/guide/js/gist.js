/* global hljs */

(function() {
  'use strict';

  var proto = Object.create(HTMLElement.prototype);

  proto.createdCallback = function() {
    // prefetch as much as possible.
    app.resources.load('/css/highlight.css');
    app.resources.load('/js/highlight.js');
  };

  proto.contentCallback = function(data) {
    var filename = this.getAttribute('filename') || Object.keys(data.files)[0],
    file = data.files[filename],
    content = pie.string.escape(file.content);

    var lines = content.split("\n");

    // remove empty lines from the beginning
    while(lines.length && !lines[0].trim().length) lines.shift();

    // and from the end
    while(lines.length && !lines[lines.length - 1].trim().length) lines.pop();

    // then remove the block of whitespace from the left.
    if(lines.length) {
      var toStrip = lines[0].match(/^(\s+)/);

      if(toStrip.length) {
        toStrip = toStrip[0];
        var regex = new RegExp("^[\\s]{" + toStrip.length + "}");
        lines = lines.map(function(l){ return l.replace(regex, ""); });
      }
    }

    content = lines.join("\n");

    app.resources.load('/css/highlight.css', function() {
      app.resources.load('/js/highlight.js', function(){

        this.innerHTML = '<code><pre>' + content + '</pre></code>';

        hljs.configure({language: file.language || ['javascript', 'json']});
        hljs.highlightBlock(this.querySelector('pre'));
      }.bind(this));
    }.bind(this));
  };

  proto.attachedCallback = function() {
    var gistId = this.getAttribute('gist'),
    path = 'https://api.github.com/gists/' + gistId;

    this.classList.add('gist-loading');

    app.ajax.get({
      url: path,
      dataSuccess: this.contentCallback.bind(this),
      success: function(){
        this.classList.remove('gist-loading');
      }.bind(this)
    });

  };

  // register element as x-gist
  window.GistElement = document.registerElement('x-gist', { prototype: proto });
})();
