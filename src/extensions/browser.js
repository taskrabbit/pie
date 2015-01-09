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
