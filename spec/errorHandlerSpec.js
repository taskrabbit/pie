describe('pie.errorHandler', function() {

  beforeEach(function(){
    this.handler = app.errorHandler;
  });

  describe('#data', function() {

    it('should cache the data on the xhr', function() {
      var xhr = {status: '200', response: JSON.stringify({'foo' : 'bar'})}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual({'foo' : 'bar'});
      expect(xhr.data).toEqual(d);
    });

    it('should return an empty object if there is no response code', function() {
      var xhr = {}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual({});
      expect(xhr.data).toEqual(d);
    });

    it('should return cached content', function() {
      var xhr = {data: {'foo' : 'bar'}}, d;

      d = this.handler.xhrData(xhr);
      expect(d).toEqual(xhr.data);
    });

  });


  describe("#errorMessagesFromRequest", function() {

    it("should allow an override based on the status", function() {
      var xhr = {"status" : "401", "data" : {}}, messages;

      messages = this.handler.errorMessagesFromRequest(xhr);
      expect(messages).toEqual(["Sorry, you aren't authorized to view this page."]);
    });

    it("should extract messages from the errors within the response", function() {
      var messages, xhr = {
        "status" : "422",
        "data" : {
          "errors" : [
            { "message" : "Something wrong." },
            { "foo" : "bar" },
            { "message" : "Incorrect stuff." }
          ]
        }
      };

      messages = this.handler.errorMessagesFromRequest(xhr);
      expect(messages).toEqual(["Something wrong.", "Incorrect stuff."]);
    });

  });

  describe("#handleXhrError", function() {

    var f = function(){ this.handler.set('responseCodeHandlers', {}); };

    beforeEach(f);
    afterEach(f);

    it('should allow handlers to be registered for specific response codes', function(){
      var handles = 0, xhr = {};

      this.handler.registerHandler(401, function(arg1){
        expect(arg1).toEqual(xhr);
        expect(this).toEqual(xhr);

        handles++;
      });

      this.handler.registerHandler(422, function(){ });

      xhr.status = 401;
      this.handler.handleXhrError(xhr);

      xhr.status = '401';
      this.handler.handleXhrError(xhr);

      xhr.status = '422';
      this.handler.handleXhrError(xhr);

      expect(handles).toEqual(2);
    });

    it('should invoke notifyErrors if the response code is not recognized', function() {
      spyOn(this.handler, 'notifyErrors');

      var xhr = {
        "status" : "412",
        "data" : {
          "errors" : [
            { "message" : "One" },
            { "message" : "Two" }
          ]
        }
      };

      this.handler.handleXhrError(xhr);
      expect(this.handler.notifyErrors).toHaveBeenCalledWith(xhr);
    });

  });


  describe("#notifyErrors", function() {

    beforeEach(function() {
      spyOn(app.notifier, 'notify');
      spyOn(app.notifier, 'clear');
    });

    it("should do nothing if there are no errors", function() {
      var xhr = {
        "status" : "422",
        "data" : {}
      };

      this.handler.notifyErrors(xhr);

      expect(app.notifier.clear).not.toHaveBeenCalled();
      expect(app.notifier.notify).not.toHaveBeenCalled();
    });

    it("should invoke the app notifier after a timeout if errors are present", function() {

      jasmine.clock().install();


      var xhr = {
        "status" : "422",
        "data" : {
          "errors" : [
            { "message" : "One" },
            { "message" : "Two" }
          ]
        }
      };

      this.handler.notifyErrors(xhr);

      jasmine.clock().tick(99);

      expect(app.notifier.clear).toHaveBeenCalledWith('error');
      expect(app.notifier.notify).not.toHaveBeenCalled();

      jasmine.clock().tick(1);

      expect(app.notifier.notify).toHaveBeenCalledWith(["One", "Two"], "error", 10000);

      jasmine.clock().uninstall();

    });

  });

  describe("#reportError", function() {

    it("should prefix the error message if a prefix is present", function() {
      spyOn(this.handler, '_reportError');

      var e1 = {"message" : "New Error", "name" : "Error Name"}, e2 = {"message" : "Some Error"};

      this.handler.reportError(e1, {"info" : "[caught]"});
      this.handler.reportError(e2);

      expect(this.handler._reportError).toHaveBeenCalledWith({"message" : "New Error", "name" : "Error Name"}, {"info" : "[caught]"});
      expect(this.handler._reportError).toHaveBeenCalledWith({"message" : "Some Error"}, {});
    });
  });

});
