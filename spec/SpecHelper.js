jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

beforeEach(function() {
  if(!window.locationDataSet) {
    window.locationDataSet = true;
    window.app.navigator.setDataFromLocation();
  }
});
