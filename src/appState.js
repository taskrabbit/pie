pie.appState = pie.model.extend('appState', {

  infoIgnore: /^__/,

  parseInfo: function(d) {
    var out = {}, r = this.infoIgnore;
    pie.object.forEach(d, function(k,v) {
      if(!r.test(k)) out[k] = v;
    });
    return out;
  },

  thingsThatCareAboutStateChanges: function() {
    return [this.app.router];
  },

  transition: function(id, skipHistory) {

    // no change
    if(this.test('__fullId', id)) return;

    var pq = this.app.pathHelper.pathAndQuery(id);
    var changes = [{}, pq.query];

    this.thingsThatCareAboutStateChanges().forEach(function(thing) {
      changes.push(thing.stateWillChange(pq.path, pq.query));
    });


    changes = pie.object.merge.apply(null, changes);

    var info = this.parseInfo(changes);

    pie.object.merge(changes, {
      __id: pq.path,
      __query: pq.query,
      __fullId: id,
      __history: !skipHistory,
      __info: info
    });


    this.setData(changes);
  }

});
