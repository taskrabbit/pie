describe("pie.router", function(){

  beforeEach(function(){
    var r = new pie.router({options: {root: '/'}, parsedUrl: {}});
    this.router = r;

    this.router.route({
      '/t/a'                : {view: 'a', name: 'aRoute'},
      '/t/:id/a'            : {view: 'a', name: 'aSpecificRoute'},
      '/t/:id/b'            : {view: 'b', name: 'bSpecificRoute'},
      '/t/unique/b'         : {view: 'b', name: 'bUniqueRoute'},
      '/t/:parent_id/b/:id' : {view: 'b', name: 'bParentRoute'},

      'apiRoute'          : '/api/a.json',
      'apiSpecificRoute'  : '/api/:id/a.json'
    }, {
      common: 'foo'
    });
  });

  it('should allow routes to be added', function(){
    // added in beforeEach();
    var r = this.router;

    expect(r.get('routes.0.options.common')).toEqual('foo');
    expect(pie.array.last(r.get('routes')).options.common).toEqual('foo');

    expect(r.get('routeNames.apiRoute').get('pathTemplate')).toEqual('/api/a.json');
    expect(r.get('routeNames.aRoute').get('pathTemplate')).toEqual('/t/a');
    expect(r.get('routeNames.apiSpecificRoute').get('pathTemplate')).toEqual('/api/:id/a.json');
    expect(r.get('routeNames.aSpecificRoute').get('pathTemplate')).toEqual('/t/:id/a');

    expect(r.get('routes.length')).toEqual(7);
  });

  it('should correctly build paths', function() {
    var r = this.router, p;

    p = r.path('apiRoute', {"p" : 0, "s" : 1});
    expect(p).toEqual('/api/a.json?p=0&s=1');

    p = r.path('apiSpecificRoute', {id: 4, "s" : 1});
    expect(p).toEqual('/api/4/a.json?s=1');

    expect(function(){
      r.path('apiSpecificRoute', {"s" : 1});
    }).toThrowError("[PIE] missing route interpolation: :id");

    p = r.path('aRoute');
    expect(p).toEqual('/t/a');

    p = r.path('aSpecificRoute', {id: 17, s: 1}, true);
    expect(p).toEqual('/t/17/a');
  });

  it('should be able to properly determine routes', function(){
    var r = this.router, o;

    o = r.parseUrl('/t/a');
    expect(o.view).toEqual('a');

    o = r.parseUrl('t/a');
    expect(o.view).toEqual('a');

    o = r.parseUrl('/t/a?q=1');
    expect(o.view).toEqual('a');
    expect(o.query.q).toEqual('1');
    expect(o.data.q).toEqual('1');
    expect(o.path).toEqual('/t/a');
    expect(o.fullPath).toEqual('/t/a?q=1');

    o = r.parseUrl('/t/30/a');
    expect(o.view).toEqual('a');
    expect(o.interpolations.id).toEqual('30');

    o = r.parseUrl('/t/unique/b');
    expect(o.view).toEqual('b');
    expect(o.name).toEqual('bUniqueRoute');

    o = r.parseUrl('/t/things/b');
    expect(o.view).toEqual('b');
    expect(o.name).toEqual('bSpecificRoute');
    expect(o.interpolations.id).toEqual('things');
    expect(o.data.id).toEqual('things');

    o = r.parseUrl('/t/things/b?q=1');
    expect(o.data.id).toEqual('things');
    expect(o.data.q).toEqual('1');

    o = r.parseUrl('/t/30/b?q=1&foo=true', true);
    expect(o.data.id).toEqual(30);
    expect(o.data.q).toEqual(1);
    expect(o.data.foo).toEqual(true);

    o = r.parseUrl('/unrecognized/path');
    expect(o.view).toEqual(undefined);
    expect(o.path).toEqual('/unrecognized/path');
    expect(o.fullPath).toEqual('/unrecognized/path');
  });

});
