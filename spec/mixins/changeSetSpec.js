describe("pie.mixins.changeSet", function() {

  beforeEach(function() {
    this.changes = [{
      name: 'foo',
      type: 'add',
      oldValue: undefined,
      value: 2
    }, {
      name: 'bar',
      type: 'add',
      oldValue: undefined,
      value: 4
    }, {
      name: 'foo',
      type: 'update',
      oldValue: 2,
      value: 4
    }, {
      name: 'qux',
      type: 'add'
    }, {
      name: 'bar',
      type: 'update',
      oldValue: 4,
      value: 8
    }, {
      name: 'foo',
      type: 'update',
      oldValue: 4,
      value: 6
    }];

    pie.object.merge(this.changes, pie.mixins.changeSet);
  });


  it("should determine if the changeset has a certain key", function() {
    expect(this.changes.has('foo')).toEqual(true);
    expect(this.changes.has('fooz')).toEqual(false);
  });

  it("should determine if the changeset has any of the provided keys", function() {
    expect(this.changes.hasAny('foo', 'bar')).toEqual(true);
    expect(this.changes.hasAny('foo', 'baz')).toEqual(true);
    expect(this.changes.hasAny('baz', 'too')).toEqual(false);
  });

  it("should allow a specific change to be retrieved", function() {
    expect(this.changes.get('bar').value).toEqual(8);
  });

  it("should allow the changeSet to be queried for a specific name and/or type", function() {
    expect(this.changes.query({name: 'foo', type: 'add'}).value).toEqual(2);
    expect(this.changes.query({name: 'foo', type: 'update'}).value).toEqual(6);
  });

  it("should allow the changeSet to be queried for all types and/or names", function() {
    expect(this.changes.queryAll({name: 'foo'}).length).toEqual(3);
    expect(this.changes.queryAll({type: 'update'}).length).toEqual(3);
    expect(this.changes.queryAll({type: 'update', name: 'foo'}).length).toEqual(2);
  });

});
