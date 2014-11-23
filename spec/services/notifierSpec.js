describe("pie.services.notifier", function(){

  beforeEach(function(){
    app.notifier.clear();
    this.notifier = app.notifier;
    this.model = this.notifier.notifications;
  });

  it("adds notifications to it's model", function(){
    expect(this.model.length()).toEqual(0);
    this.notifier.notify('test message');

    expect(this.model.length()).toEqual(1);

    var msg = this.model.get(0);

    expect(msg.message).toEqual('test message');
    expect(msg.id).toBeTruthy();
    expect(msg.type).toEqual('message');
  });

  it("clears the notifications automatically when a delay is provided", function() {
    jasmine.clock().install();

    this.notifier.notify('test message', 'message', 10);

    expect(this.model.length()).toEqual(1);

    jasmine.clock().tick(10);

    expect(this.model.length()).toEqual(0);

    jasmine.clock().uninstall();
  });

  it("should provide the correct autoclose timeout", function() {
    expect(this.notifier.getAutoRemoveTimeout(undefined)).toEqual(7000);
    expect(this.notifier.getAutoRemoveTimeout(null)).toEqual(null);
    expect(this.notifier.getAutoRemoveTimeout(false)).toEqual(false);
    expect(this.notifier.getAutoRemoveTimeout(true)).toEqual(7000);
    expect(this.notifier.getAutoRemoveTimeout(100)).toEqual(100);
  });

  it("should clear existing notifications", function() {
    this.notifier.notify('first', 'message');
    this.notifier.notify('second', 'error');
    this.notifier.notify('third', 'warning');
    this.notifier.notify('fourth', 'warning');

    expect(this.model.length()).toEqual(4);

    this.notifier.clear('warning');

    expect(this.model.length()).toEqual(2);
    this.notifier.clear();
    expect(this.model.length()).toEqual(0);
  });

});
