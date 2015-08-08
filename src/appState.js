pie.appState = pie.model.extend('appState', {

  infoIgnore: /^(__|_version)/,

  parseInfo: function(d) {
    var out = {}, r = this.infoIgnore;
    pie.object.forEach(d, function(k,v) {
      if(!r.test(k)) out[k] = v;
    });
    return out;
  },

  buildFullId: function(base, info) {
    if(pie.object.isEmpty(info)) return base;
    return base + '?' + pie.object.serialize(info);
  },

  thingsThatCareAboutStateChanges: function() {
    return [this.app.router];
  },

  transition: function(id, skipHistory) {
    var split = id.split('?'),
    base = split[0],
    query = split[1];

    // no change
    if(this.test('__id', base)) return;


    if(query) query = pie.string.deserialize(query);

    var changes = [query];

    this.thingsThatCareAboutStateChanges().forEach(function(thing) {
      changes.push(thing.stateWillChange(base, query));
    });


    changes = pie.object.merge.apply(null, changes);

    var info = this.parseInfo(changes);

    pie.object.merge(changes, {
      __id: base,
      __fullId: this.buildFullId(base, info),
      __history: !skipHistory,
      __info: info
    });


    this.setData(changes);
  }

});
