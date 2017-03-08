var assert = require('assert');
var util = require('util');
var proxyquire = require('proxyquire');
var globals = require('./global.js');

var WEATHER_DATA = '{"data":{"current_condition":[{"cloudcover":"2","humidity":"69","observation_time":"04:39 PM","precipMM":"0.0","pressure":"1010","temp_C":"18","temp_F":"65","visibility":"10","weatherCode":"113","weatherDesc":[{"value":"Sunny"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0001_sunny.png"}],"winddir16Point":"WNW","winddirDegree":"285","windspeedKmph":"25","windspeedMiles":"15"}],"request":[{"query":"Lat 52.25 and Lon -7.15","type":"LatLon"}],"weather":[{"date":"2013-09-19","precipMM":"3.4","tempMaxC":"18","tempMaxF":"65","tempMinC":"7","tempMinF":"45","weatherCode":"113","weatherDesc":[{"value":"Sunny"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0001_sunny.png"}],"winddir16Point":"WNW","winddirDegree":"286","winddirection":"WNW","windspeedKmph":"32","windspeedMiles":"20"},{"date":"2013-09-20","precipMM":"0.1","tempMaxC":"16","tempMaxF":"60","tempMinC":"11","tempMinF":"53","weatherCode":"116","weatherDesc":[{"value":"Partly Cloudy"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png"}],"winddir16Point":"WSW","winddirDegree":"238","winddirection":"WSW","windspeedKmph":"13","windspeedMiles":"8"},{"date":"2013-09-21","precipMM":"0.1","tempMaxC":"16","tempMaxF":"60","tempMinC":"15","tempMinF":"60","weatherCode":"116","weatherDesc":[{"value":"Partly Cloudy"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png"}],"winddir16Point":"SSW","winddirDegree":"194","winddirection":"SSW","windspeedKmph":"22","windspeedMiles":"14"},{"date":"2013-09-22","precipMM":"0.7","tempMaxC":"16","tempMaxF":"61","tempMinC":"14","tempMinF":"58","weatherCode":"119","weatherDesc":[{"value":"Cloudy"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0003_white_cloud.png"}],"winddir16Point":"SSW","winddirDegree":"200","winddirection":"SSW","windspeedKmph":"20","windspeedMiles":"12"},{"date":"2013-09-23","precipMM":"0.1","tempMaxC":"16","tempMaxF":"61","tempMinC":"11","tempMinF":"52","weatherCode":"119","weatherDesc":[{"value":"Cloudy"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0003_white_cloud.png"}],"winddir16Point":"SSE","winddirDegree":"154","winddirection":"SSE","windspeedKmph":"21","windspeedMiles":"13"},{"date":"2013-09-24","precipMM":"0.0","tempMaxC":"16","tempMaxF":"61","tempMinC":"12","tempMinF":"53","weatherCode":"113","weatherDesc":[{"value":"Sunny"}],"weatherIconUrl":[{"value":"http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0001_sunny.png"}],"winddir16Point":"E","winddirDegree":"97","winddirection":"E","windspeedKmph":"11","windspeedMiles":"7"}]}}';

var mocks = {
  request: function(obj, cb) {
    return cb(null, null, JSON.parse(WEATHER_DATA));
  },
  'fh-mbaas-api' : globals.fh
};

var weather = proxyquire('lib/weather.js', mocks);

exports.setUp = function(finish){
  return finish();
};

exports.tearDown = function(finish){
  return finish();
};

exports.testGetWeather = function(finish){

  var lat = 0;
  var lon = 0;
  var cacheKey = weather.getCacheKey(lat, lon);
  weather.clearCache(cacheKey, function(){
    var params = {lat: lat, lon: lon};
    weather.getWeather(params, function(err, res){
      assert.ok(!err, 'Unexpected error: ' + util.inspect(err));
      assert.equal(6, res.data.length);
      weather.getFromCache(cacheKey, function(err, cached){
        assert.ok(!err);
        assert.ok(cached);
        finish();
      });
    });
  });
};