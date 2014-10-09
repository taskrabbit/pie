describe("Pie Dom Extension", function() {
  describe('#createElement', function() {

    it('should create an element which is not attached to the dom', function() {
      var start = document.getElementsByTagName('*').length, finish, dom;

      dom = pie.dom.createElement('<ul><li>First</li><li>Second</li></ul>');

      expect(dom.parentNode).toBeFalsy();
      expect(dom.innerHTML).toEqual('<li>First</li><li>Second</li>');
      expect(dom.tagName).toEqual('UL');

      finish = document.getElementsByTagName('*').length;
      expect(start).toEqual(finish);
    });

  });
});
