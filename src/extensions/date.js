// takes a iso date string and converts to a local time representing 12:00am, on that date.
pie.date.dateFromISO = function(isoDateString) {
  if(!isoDateString) return null;
  var parts = isoDateString.split('T')[0].split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

// assuming that we're on ES5 and can use new Date(isoString).
pie.date.timeFromISO = function(isoTimeString) {
  if(!isoTimeString) return null;
  if(isoTimeString.indexOf('T') < 0) return pie.date.dateFromISO(isoTimeString);
  return new Date(isoTimeString);
};
