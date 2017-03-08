//an example of integrating with third-party services.
var RateLimiter = require('limiter').RateLimiter;
var secondLimiter = new RateLimiter(3, 'second');
var hourLimiter = new RateLimiter(500, 'hour');
var request = require('request');

var fh = require('fh-mbaas-api');

var API_KEY = "qfyye6yt5hedsgk8v8ey7n3n";
var CACHE_EXPIRE = 1*60*60; //cache weather data for 1 hour

var WEATHER_PROVIDER_URL = "http://api.worldweatheronline.com/free/v1/weather.ashx";

exports.setWeatherProvider = function(provider){
  WEATHER_PROVIDER_URL = provider;
};

exports.clearCache = function(cacheKey, cb){
  fh.cache({
    act:"remove",
    key:cacheKey
  }, cb);
};

var fetchWeatherData = function(latitude, longitude, callback){
  var url = WEATHER_PROVIDER_URL;
  console.log("provider url", url);
  request({method: 'GET', url: url, qs: {
    q: latitude + "," + longitude,
    format: 'json',
    num_of_days: 6,
    key: API_KEY
  }, json: true}, function(error, response, body){
    callback(error, body);
  });
};

exports.getFromCache = getFromCache = function(cacheKey, callback){
  console.log("Get data from cache");
  fh.cache({
    act:"load",
    key:cacheKey
  }, function(err,res) {
    if(err) return callback(err);
    var data = JSON.parse(res);
    return callback(null, data);
  });
};

var setInCache = function(cacheKey, data){
  fh.cache({
    act: "save",
    key: cacheKey,
    value: JSON.stringify(data)
  }, function(err) {
    if (err) console.log("Cache save error", err);
  });
};

var processWeatherData = function(originData, callback){
  //console.log("Got weather data", JSON.stringify(originData));
  var result = originData.data.weather.map(function(item){
    return {
      date: item.date,
      high: item.tempMaxC,
      low: item.tempMinC,
      desc: item.weatherDesc[0].value,
      icon: item.weatherIconUrl[0].value
    };
  });
  return callback(null, {data: result});
};

var getCacheKey = function(lati, longi){
  var lat = parseFloat(lati).toFixed(3);
  var lon = parseFloat(longi).toFixed(3);
  var cachekey = "key_" + lat + "_" + lon;
  cachekey = cachekey.replace(/\./g, '_');
  return cachekey;
};

exports.getCacheKey = getCacheKey;

exports.getWeather = function(params, callback){
  //service provided by worldweatheronline(http://developer.worldweatheronline.com/)
  //free plan, limit: 3 req/second and 500 req/hour
  var lat = params.lat;
  var lon = params.lon;
  console.log("lat", lat);
  console.log("longi", lon);
  var cachekey = getCacheKey(lat, lon);
  console.log("cache key is ", cachekey);
  //first, check if we have a cache version
  getFromCache(cachekey, function(err, cacheData){
    if(err || (cacheData == null)){
      console.log('no data from cache');
      //no cache data, need to get from the remote service
      //check we are not over request limits
      secondLimiter.removeTokens(1, function(err, remainRequests){
        if(err){
          return callback('429 Too Many Requests (1)');
        }
        console.log('not over second limit');
        hourLimiter.removeTokens(1, function(err, remainRequests){
          if(err){
            return callback('429 Too Many Requests (2)');
          }
          console.log('not over hour limit');
          //we are not over limit, make the request
          fetchWeatherData(lat, lon, function(err, weatherData){
            //request failed, return it to the client
            if(err){
              return callback(err);
            }
            //request succeeded, save it in the cache
            setInCache(cachekey, weatherData);
            //return the data
            processWeatherData(weatherData, callback);
          });
        });
      });
    } else {
      //found data in the cache, return
      return processWeatherData(cacheData, callback);
    }
  });
};