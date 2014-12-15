// made to be used as an instance so multiple translations could exist if we so choose.
pie.i18n = function i18n(app) {
  this.translations = pie.object.merge({}, pie.i18n.defaultTranslations);
  this.app = app;
};

pie.i18n.defaultTranslations = {
  app: {
    timeago: {
      now: "just now",
      minutes: {
        one: "%{count} minute ago",
        other: "%{count} minutes ago"
      },
      hours: {
        one: "%{count} hour ago",
        other: "%{count} hours ago"
      },
      days: {
        one: "%{count} day ago",
        other: "%{count} days ago"
      },
      weeks: {
        one: "%{count} week ago",
        other: "%{count} weeks ago"
      },
      months: {
        one: "%{count} month ago",
        other: "%{count} months ago"
      },
      years: {
        one: "%{count} year ago",
        other: "%{count} years ago"
      }
    },
    time: {
      formats: {
        isoDate: '%Y-%m-%d',
        isoTime: '%Y-%m-%dT%H:%M:%S.%L%:z',
        shortDate: '%m/%d/%Y',
        longDate: '%B %-do, %Y'
      },
      meridiems: {
        am: 'am',
        pm: 'pm'
      },
      ordinals: {
        o0: "th",
        o1: "st",
        o2: "nd",
        o3: "rd",
        o4: "th",
        o5: "th",
        o6: "th",
        o7: "th",
        o8: "th",
        o9: "th"
      },
      day_names: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      short_day_names: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ],
      month_names: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      short_month_names: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
      ]
    }
  }
};


pie.i18n.prototype._ampm = function(num) {
  return this.t('app.time.meridiems.' + (num >= 12 ? 'pm' : 'am'));
};


pie.i18n.prototype._countAlias = {
  '0' : 'zero',
  '1' : 'one',
  '-1' : 'negone'
};


pie.i18n.prototype._dayName = function(d) {
  return this.t('app.time.day_names.' + d);
};


pie.i18n.prototype._hour = function(h) {
  if(h > 12) h -= 12;
  if(!h) h += 12;
  return h;
};


pie.i18n.prototype._monthName = function(m) {
  return this.t('app.time.month_names.' + m);
};


pie.i18n.prototype._nestedTranslate = function(t, data) {
  return t.replace(/\$\{([^\}]+)\}/, function(match, path) {
    return this.translate(path, data);
  }.bind(this));
},


// assumes that dates either come in as dates, iso strings, or epoch timestamps
pie.i18n.prototype._normalizedDate = function(d) {
  if(String(d).match(/^\d+$/)) {
    d = parseInt(d, 10);
    if(String(d).length < 13) d *= 1000;
    d = new Date(d);
  } else if(pie.object.isString(d)) {
    d = pie.date.timeFromISO(d);
  } else {
    // let the system parse
    d = new Date(d);
  }
  return d;
},


pie.i18n.prototype._shortDayName = function(d) {
  return this.t('app.time.short_day_names.' + d) || this._dayName(d).slice(0, 3);
};


pie.i18n.prototype._shortMonthName = function(m) {
  return this.t('app.time.short_month_names.' + m) || this._monthName(m).slice(0, 3);
};


pie.i18n.prototype._pad = function(num, cnt, pad) {
  var s = '',
      p = cnt - num.toString().length;
  if(pad === undefined) pad = ' ';
  while(p>0){
    s += pad;
    p -= 1;
  }
  return s + num.toString();
};

pie.i18n.prototype._ordinal = function(number) {
  var unit = number % 100;

  if(unit >= 11 && unit <= 13) unit = 0;
  else unit = number % 10;

  return this.t('app.time.ordinals.o' + unit);
},

pie.i18n.prototype._timezoneAbbr = function(date) {
  var str = date && date.toString();
  return str && str.split(/\((.*)\)/)[1];
},


pie.i18n.prototype._utc = function(t) {
  var t2 = new Date(t.getTime());
  t2.setMinutes(t2.getMinutes() + t2.getTimezoneOffset());
  return t2;
};


pie.i18n.prototype.load = function(data, shallow) {
  var f = shallow ? pie.object.merge : pie.object.deepMerge;
  f.call(null, this.translations, data);
};


pie.i18n.prototype.translate = function(/* path, data, stringChange1, stringChange2 */) {
  var changes = pie.array.from(arguments),
  path = changes.shift(),
  data = pie.object.isObject(changes[0]) ? changes.shift() : undefined,
  translation = pie.object.getPath(this.translations, path),
  count;

  if (pie.object.has(data, 'count') && pie.object.isObject(translation)) {
    count = (data.count || 0).toString();
    count = this._countAlias[count] || (count > 0 ? 'other' : 'negother');
    translation = translation[count] === undefined ? translation.other : translation[count];
  }

  if(!translation) {

    if(data && data.hasOwnProperty('default')) {
      translation = pie.func.valueFrom(data.default);
    } else {
      this.app.debug("Translation not found: " + path);
      return "";
    }
  }


  if(pie.object.isString(translation)) {
    translation = translation.indexOf('${') === -1 ? translation : this._nestedTranslate(translation, data);
    translation = translation.indexOf('%{') === -1 ? translation : pie.string.expand(translation, data);
  }

  if(changes.length) {
    changes.unshift(translation);
    translation = pie.string.change.apply(null, changes);
  }

  return translation;
};


pie.i18n.prototype.timeago = function(t, now, scope) {
  t = this._normalizedDate(t).getTime()  / 1000;
  now = this._normalizedDate(now || new Date()).getTime() / 1000;

  var diff = now - t, c;

  scope = scope || 'app';

  if(diff < 60) { // less than a minute
    return this.t(scope + '.timeago.now', {count: diff});
  } else if (diff < 3600) { // less than an hour
    c = Math.floor(diff / 60);
    return this.t(scope + '.timeago.minutes', {count: c});
  } else if (diff < 86400) { // less than a day
    c = Math.floor(diff / 3600);
    return this.t(scope + '.timeago.hours', {count: c});
  } else if (diff < 86400 * 7) { // less than a week (
    c = Math.floor(diff / 86400);
    return this.t(scope + '.timeago.days', {count: c});
  } else if (diff < 86400 * 30) { // less than a month
    c = Math.floor(diff / (86400 * 7));
    return this.t(scope + '.timeago.weeks', {count: c});
  } else if (diff < 86500 * 365.25) { // less than a year
    c = Math.floor(diff / (86400 * 365.25 / 12));
    return this.t(scope + '.timeago.months', {count: c});
  } else {
    c = Math.floor(diff / (86400 * 365.25));
    return this.t(scope + '.timeago.years', {count: c});
  }
};

// pass in the date instance and the string 'format'
pie.i18n.prototype.strftime = function(date, f) {
  date = this._normalizedDate(date);

  // named format from translations.time.
  if(!~f.indexOf('%')) f = this.t('app.time.formats.' + f);

  var weekDay           = date.getDay(),
      day               = date.getDate(),
      year              = date.getFullYear(),
      month             = date.getMonth() + 1,
      hour              = date.getHours(),
      hour12            = this._hour(hour),
      meridiem          = this._ampm(hour),
      secs              = date.getSeconds(),
      mins              = date.getMinutes(),
      mills             = date.getMilliseconds(),
      offset            = date.getTimezoneOffset(),
      absOffsetHours    = Math.floor(Math.abs(offset / 60)),
      absOffsetMinutes  = Math.abs(offset) - (absOffsetHours * 60),
      timezoneoffset    = (offset > 0 ? "-" : "+") + this._pad(absOffsetHours, 2, '0') + this._pad(absOffsetMinutes, 2, '0');

  f = f.replace("%a", this._shortDayName(weekDay))
      .replace("%A",  this._dayName(weekDay))
      .replace("%B",  this._monthName(month - 1))
      .replace("%b",  this._shortMonthName(month - 1))
      .replace("%d",  this._pad(day, 2, '0'))
      .replace("%e",  this._pad(day, 2, ' '))
      .replace("%-do", day + this._ordinal(day))
      .replace("%-d", day)
      .replace("%H",  this._pad(hour, 2, '0'))
      .replace("%k",  this._pad(hour, 2, ' '))
      .replace('%-H', hour)
      .replace('%-k', hour)
      .replace("%I",  this._pad(hour12, 2, '0'))
      .replace("%l",  hour12)
      .replace("%m",  this._pad(month, 2, '0'))
      .replace("%-m", month)
      .replace("%M",  this._pad(mins, 2, '0'))
      .replace("%p",  meridiem.toUpperCase())
      .replace("%P",  meridiem)
      .replace("%S",  this._pad(secs, 2, '0'))
      .replace("%-S", secs)
      .replace('%L',  this._pad(mills, 3, '0'))
      .replace('%-L', mills)
      .replace("%w",  weekDay)
      .replace("%y",  this._pad(year % 100))
      .replace("%Y",  year)
      .replace("%z",  timezoneoffset)
      .replace("%:z", timezoneoffset.slice(0,3) + ':' + timezoneoffset.slice(3))
      .replace("%Z",  this._timezoneAbbr(date));

  return f;
};

pie.i18n.prototype.t = pie.i18n.prototype.translate;
pie.i18n.prototype.l = pie.i18n.prototype.strftime;
