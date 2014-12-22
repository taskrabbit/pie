describe("pie.mixins.changeSet", function() {

  beforeEach(function() {
    this.changes = [{
      name: 'foo',
      oldValue: undefined,
      value: 2
    }, {
      name: 'bar'
    }, {
      name: 'foo',
      oldValue: 2,
      value: 4
    }, {
      name: 'qux'
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

});
