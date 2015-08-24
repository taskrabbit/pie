describe("pie.router", function(){

  beforeEach(function(){
    var r = pie.router.create();
    this.router = r;

    this.router.map({
      '/t/a'                : {view: 'a', name: 'aRoute'},
      '/t/:id/a'            : {view: 'a', name: 'aSpecificRoute'},
      '/t/:id/b'            : {view: 'b', name: 'bSpecificRoute'},
      '/t/unique/b'         : {view: 'b', name: 'bUniqueRoute'},
      '/t/:parent_id/b/:id' : {view: 'b', name: 'bParentRoute'},
      '/m/*path'            : {view: 'm', name: 'mRoute'},

      'api.route'          : '/api/a.json',
      'api.specificRoute'  : '/api/:id/a.json'
    }, {
      common: 'foo'
    });
  });

  it('should allow routes to be added', function(){
    var r = this.router;

    expect(r.children[0].get('config.common')).toEqual('foo');
    expect(pie.array.last(r.children).get('config.common')).toEqual('foo');

    expect(r.getChild('api.route').get('pathTemplate')).toEqual('/api/a.json');
    expect(r.getChild('aRoute').get('pathTemplate')).toEqual('/t/a');
    expect(r.getChild('api.specificRoute').get('pathTemplate')).toEqual('/api/:id/a.json');
    expect(r.getChild('aSpecificRoute').get('pathTemplate')).toEqual('/t/:id/a');
    expect(r.getChild('mRoute').get('pathTemplate')).toEqual('/m/*path');

    expect(r.children.length).toEqual(8);
  });

  it('should correctly build paths', function() {
    var r = this.router, p;

    p = r.path('api.route', {"p" : 0, "s" : 1});
    expect(p).toEqual('/api/a.json?p=0&s=1');

    p = r.path('api.specificRoute', {id: 4, "s" : 1});
    expect(p).toEqual('/api/4/a.json?s=1');

    expect(function(){
      r.path('api.specificRoute', {"s" : 1});
    }).toThrowError("[PIE] missing route interpolation: :id");

    p = r.path('aRoute');
    expect(p).toEqual('/t/a');
  });

  it('should be able to properly determine routes', function(){
    var r = this.router, o;

    o = r.findRoute('/t/a');
    expect(o.get('config.view')).toEqual('a');

    o = r.findRoute('t/a');
    expect(o).toEqual(undefined);

    o = r.findRoute('/t/a?q=1');
    expect(o).toEqual(undefined);

    o = r.findRoute('/t/30/a');
    expect(o.get('config.view')).toEqual('a');
    expect(o.interpolations('/t/30/a').id).toEqual('30');

    o = r.findRoute('/t/unique/b');
    expect(o.get('config.view')).toEqual('b');
    expect(o.get('name')).toEqual('bUniqueRoute');

    o = r.findRoute('/t/things/b');
    expect(o.get('config.view')).toEqual('b');
    expect(o.get('name')).toEqual('bSpecificRoute');

    o = r.findRoute('/m/thing');
    expect(o.get('config.view')).toEqual('m');

    o = r.findRoute('/m/thing/foo');
    expect(o.get('config.view')).toEqual('m');

    o = r.findRoute('/unrecognized/path');
    expect(o).toEqual(undefined);
  });

  it("should correctly sort the routes", function() {
    var routes = this.router.children.map(function(r){ return r.get('pathTemplate'); });
    expect(routes).toEqual([
      '/t/:parent_id/b/:id',
      '/t/unique/b',
      '/api/:id/a.json',
      '/t/:id/a',
      '/t/:id/b',
      '/api/a.json',
      '/t/a',
      '/m/*path'
    ]);
  });
});
