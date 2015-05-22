describe("pie.cache", function() {

  beforeEach(function() {
    this.cache = pie.cache.create();
    this.now = this.cache.currentTime();
    spyOn(this.cache, 'currentTime').and.callFake(function(){
      return this.now;
    }.bind(this));
  });

  it("should set and get values like a normal model", function() {
    this.cache.set('foo', 'bar');
    expect(this.cache.get('foo')).toEqual('bar');
  });

  describe("expiration formats", function() {

    it("should allow an expiration to be set for a key", function() {
      this.cache.set('foo', 'bar', {ttl: 1000});
      var wrap = this.cache.data.foo;
      expect(wrap.__data).toEqual('bar');
      expect(wrap.__expiresAt).toEqual(this.now + 1000);
    });

    it("should allow a timestamp to be used as the expiration", function() {
      var nowPlus = this.now + 5000, wrap;
      this.cache.set('foo', 'bar', {expiresAt: nowPlus});
      wrap = this.cache.data.foo;
      expect(wrap.__expiresAt).toEqual(nowPlus);
    });

    it("should allow an iso timestamp as the expiration", function() {
      var iso = "2020-10-10",
        timestamp = pie.date.dateFromISO(iso).getTime(),
        wrap;

      this.cache.set('foo', 'bar', {expiresAt: iso});
      wrap = this.cache.data.foo;
      expect(wrap.__expiresAt).toEqual(timestamp);
    });

    it("should allow a numeric string as a timestamp", function() {
      var nowPlus = String(this.now + 5000), wrap;
      this.cache.set('foo', 'bar', {expiresAt: nowPlus});
      wrap = this.cache.data.foo;
      expect(wrap.__expiresAt).toEqual(parseInt(nowPlus, 10));
    });

  });

  describe("key expiration", function() {

    it('should not return back an expired key', function() {
      this.cache.set('foo', 'bar', {expiresAt: this.now + 1000});
      expect(this.cache.get('foo')).toEqual('bar');
      this.now += 1000;
      expect(this.cache.get('foo')).toEqual(undefined);
    });

    it('should clear the key when it is read and the key is expired', function() {
      this.cache.set('foo', 'bar', {expiresAt: this.now + 1000});
      this.now += 1000;
      this.cache.get('foo');
      expect(this.cache.data.foo).toEqual(undefined);
    });

  });

  describe("getOrSet", function() {

    it("should allow a path to be getOrSet", function() {
      var r = this.cache.getOrSet('foo', 'bar');
      expect(r).toEqual('bar');

      r = this.cache.getOrSet('foo', 'baz');
      expect(r).toEqual('bar');

      r = this.cache.getOrSet('bar', function(){
        return 'baz';
      });
      expect(r).toEqual('baz');

      r = this.cache.getOrSet('bar', function() {
        return 'biz';
      });
      expect(r).toEqual('baz');
    });

  });

});
