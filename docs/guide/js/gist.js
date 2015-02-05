/* global hljs */

(function() {
  'use strict';

  var gistCache = {};
  var proto = Object.create(HTMLElement.prototype);

  proto.externalResources = function(){
    return [app.router.path('/js/highlight.js')];
  },

  proto.contentCallback = function(data) {
    var filename = this.getAttribute('filename') || Object.keys(data.files)[0],
    file = data.files[filename],
    content = file && pie.string.escape(file.content) || 'NOT FOUND';

    var lines = content.split("\n");

    // remove empty lines from the beginning
    while(lines.length && !lines[0].trim().length) lines.shift();

    // and from the end
    while(lines.length && !lines[lines.length - 1].trim().length) lines.pop();

    // then remove the block of whitespace from the left.
    if(lines.length) {
      var toStrip = lines[0].match(/^(\s+)/);

      if(toStrip && toStrip.length) {
        toStrip = toStrip[0];
        var regex = new RegExp("^[\\s]{" + toStrip.length + "}");
        lines = lines.map(function(l){ return l.replace(regex, ""); });
      }
    }

    app.resources.load(this.externalResources(), function() {

      this.innerHTML = "<code><pre>" + lines.join("\n") + "</pre></code>";

      hljs.configure({useBr: true, language: file && file.language || ['javascript', 'json', 'html']});
      hljs.highlightBlock(this.querySelector('pre'));

    }.bind(this));
  };

  proto.attachedCallback = function() {
    var gistId = this.getAttribute('gist'),
    path = 'https://api.github.com/gists/' + gistId;

    this.innerHTML = '<code><pre class="hljs">Loading...</pre></code>';
    this.classList.add('gist-loading');

    setTimeout(function(){
      app.resources.load({
        src: path,
        dataSuccess: function(content){
          gistCache[gistId] = content;
        }
      }, function() {
        this.contentCallback(gistCache[gistId]);
        this.classList.remove('gist-loading');
      }.bind(this));
    }.bind(this), 1);
  };

  // register element as x-gist
  window.GistElement = document.registerElement('x-gist', {
    prototype: proto
  });
})();
