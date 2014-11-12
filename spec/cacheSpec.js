describe("pie.cache", function() {

  beforeEach(function() {
    this.cache = new pie.cache();
    this.now = this.cache.currentTime();
    spyOn(this.cache, 'currentTime').and.returnValue(this.now);
  });

  it("should set and get values like a normal model", function() {
    this.cache.set('foo', 'bar');
    expect(this.cache.get('foo')).toEqual('bar');
  });

  it("should allow an expiration to be set for a key", function() {
    this.cache.set('foo', 'bar', {ttl: 1000});
    var wrap = this.cache.data.foo;
    expect(wrap.data).toEqual('bar');
    expect(wrap.expiresAt).toEqual(this.now + 1000);
  });

});
