describe("pie.services.router", function(){

  beforeEach(function(){
    var r = new pie.services.router({parsedUrl: {}});
    this.router = r;

    this.router.route({
      '/t/a'                : {view: 'a', name: 'aRoute'},
      '/t/:id/a'            : {view: 'a', name: 'aSpecificRoute'},
      '/t/unique/b'         : {view: 'b', name: 'bSpecificRoute'},
      '/t/:parent_id/b/:id' : {view: 'b', name: 'bParentRoute'},

      'apiRoute'          : '/api/a.json',
      'apiSpecificRoute'  : '/api/:id/a.json'
    });
  });

  it('should allow routes to be added', function(){
    // added in beforeEach();
    var r = this.router;

    expect(r.namedRoutes.apiRoute).toEqual('/api/a.json');
    expect(r.namedRoutes.aRoute).toEqual('/t/a');
    expect(r.namedRoutes.apiSpecificRoute).toEqual('/api/:id/a.json');
    expect(r.namedRoutes.aSpecificRoute).toEqual('/t/:id/a');

    expect(r.routes.apiRoute).toEqual(undefined);
    expect(r.routes.apiSpecificRoute).toEqual(undefined);

    expect(r.routes['/t/a']).not.toBeFalsy();
    expect(r.routes['/t/:id/a']).not.toBeFalsy();
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

  it('should build, cache, and clear the _routeKeys variable', function() {
    var r = this.router, keys = r.routeKeys();

    // object id, ensure it's the same object later on
    keys._testId = 1;

    expect(keys[0]).toEqual('/t/unique/b');
    expect(keys[1]).toEqual('/t/a');
    expect(keys[2]).toEqual('/t/:id/a');
    expect(keys[3]).toEqual('/t/:parent_id/b/:id');

    expect(r._routeKeys._testId).toEqual(keys._testId);
    expect(r.routeKeys()._testId).toEqual(keys._testId);
    r.route({'/new': {view: 'c'}});

    expect(r._routeKeys).toEqual(undefined);
    expect(r.routeKeys()).not.toEqual(undefined);
  });

});
