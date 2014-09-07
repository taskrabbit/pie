describe("pie.services.notifier", function(){

  beforeEach(function(){
    app.notifier.clear();
  });

  it("shows notifications by adding dom elements to it's el", function(){
    expect(document.querySelectorAll('#notificiations > *').length).toEqual(0);
    app.notifier.notify('test message');

    var nodes = document.querySelectorAll('#notifications .pie-alert'), node;
    expect(nodes.length).toEqual(1);

    node = nodes[0];

    expect(node.classList.contains('pie-alert-message')).toEqual(true);
    expect(node.classList.contains('pie-alert-error')).toEqual(false);
  });

  it("clears the notifications automatically when a delay is provided", function() {
    jasmine.clock().install();

    app.notifier.notify('test message', 'message', 10);

    expect(document.querySelectorAll('#notifications .pie-alert').length).toEqual(1);

    jasmine.clock().tick(10);

    expect(document.querySelectorAll('#notifications .pie-alert').length).toEqual(0);

    jasmine.clock().uninstall();
  });

  it("should provide the correct autoclose timeout", function() {
    expect(app.notifier.getAutoCloseTimeout(undefined)).toEqual(7000);
    expect(app.notifier.getAutoCloseTimeout(null)).toEqual(null);
    expect(app.notifier.getAutoCloseTimeout(false)).toEqual(false);
    expect(app.notifier.getAutoCloseTimeout(true)).toEqual(7000);
    expect(app.notifier.getAutoCloseTimeout(100)).toEqual(100);
  });

  it("should clear existing notifications", function() {
    app.notifier.notify('first', 'message');
    app.notifier.notify('second', 'error');
    app.notifier.notify('third', 'warning');
    app.notifier.notify('fourth', 'warning');

    expect(document.querySelectorAll('#notifications .pie-alert').length).toEqual(4);

    app.notifier.clear('warning');

    expect(document.querySelectorAll('#notifications .pie-alert').length).toEqual(2);
    app.notifier.clear();
    expect(document.querySelectorAll('#notifications .pie-alert').length).toEqual(0);
  });

});
