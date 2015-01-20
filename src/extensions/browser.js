/* From old jQuery */
pie.browser.agent = function() {
  if(pie.browser.__agent) return pie.browser.__agent;

  var ua = navigator.userAgent.toLowerCase(),
  match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
    /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
    [];

  var b = {
    browser: match[ 1 ] || "",
    version: match[ 2 ] || "0"
  };

  if(b.browser) {
    b[b.browser] = true;
  }

  // Chrome is Webkit, but Webkit is also Safari.
  if ( b.chrome ) {
    b.webkit = true;
  } else if ( b.webkit ) {
    b.safari = true;
  }

  return pie.browser.__agent = b;
};

pie.browser.getCookie = function(key, options) {
  var decode = options && options.raw ? function(s) { return s; } : decodeURIComponent,
  pairs = document.cookie.split('; '),
  pair;

  for(var i = 0; i < pairs.length; i++) {
    pair = pairs[i];
    if(!pair) continue;

    pair = pair.split('=');
    if(decode(pair[0]) === key) return decode(pair[1] || '');
  }

  return null;
};


pie.browser.isRetina = function() {
  return window.devicePixelRatio > 1;
};


pie.browser.isTouchDevice = function() {
  return pie.object.has(window, 'ontouchstart') ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    navigator.MaxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;
};

pie.browser.testMediaQuery = function(query) {
  query = pie.browser.mediaQueries[query] || query;
  var matchMedia = window.matchMedia || window.msMatchMedia;
  if(matchMedia) return matchMedia(query).matches;
  return undefined;
};

pie.browser.orientation = function() {
  switch (window.orientation) {
  case 90:
  case -90:
    return 'landscape';
  default:
    return 'portrait';
  }
};

pie.browser.setCookie = function(key, value, options) {
  options = pie.object.merge({}, options);

  /* jslint eqnull:true */
  if(value == null) options.expires = -1;

  if (pie.object.isNumber(options.expires)) {
    var days = options.expires;
    options.expires = new Date();
    options.expires.setDate(options.expires.getDate() + days);
  }

  value = String(value);

  var cookieValue = [
    encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
    options.path    ? '; path=' + options.path : '',
    options.domain  ? '; domain=' + options.domain : '',
    options.secure  ? '; secure' : ''
  ].join('');

  document.cookie = cookieValue;
  return cookieValue;
};
