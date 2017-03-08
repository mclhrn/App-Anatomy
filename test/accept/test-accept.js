//acceptance tests
var request = require("request");
var util = require('util');
var assert = require('assert');
var nock = require('nock');

var baseUrl = "http://127.0.0.1:8052/cloud/";

exports.testCloudCall = function(finish){
  request({url: baseUrl + "hello", method: 'POST', json: true}, function(err, response, body){
    console.log("body", body);
    assert.ok(!err, 'Unexpected error: ', util.inspect(err));
    console.log("body", body.text);
    assert.equal(0, body.text.indexOf('Hello from FeedHenry'));
    finish();
  });
};

exports.testGetWeather = function(finish){

  // Use nock to mock out the external weather service
  var weather = nock('http://api.worldweatheronline.com')
    .get('/free/v1/weather.ashx?q=52.251%2C-7.153&format=json&num_of_days=6&key=qfyye6yt5hedsgk8v8ey7n3n')
    .reply(200, {
      "data": {
        "weather": [{
          "date": "2013-09-19",
          "precipMM": "3.4",
          "tempMaxC": "18",
          "tempMaxF": "65",
          "tempMinC": "7",
          "tempMinF": "45",
          "weatherCode": "113",
          "weatherDesc": [{
            "value": "Sunny"
          }],
          "weatherIconUrl": [{
            "value": "http://cdn.worldweatheronline.net/images/wsymbols01_png_64/wsymbol_0001_sunny.png"
          }],
          "winddir16Point": "WNW",
          "winddirDegree": "286",
          "winddirection": "WNW",
          "windspeedKmph": "32",
          "windspeedMiles": "20"
        }]
      }
    });

  request({url: baseUrl + "getWeather", method: 'POST', json: {"lat":52.251,"lon":-7.153}}, function(err, response, body){
  console.log("body: " + util.inspect(body))
    assert.ok(!err, 'Unexpected error: ', util.inspect(err));
    assert.equal(200, response.statusCode);
    assert.ok(body.data);
    assert.equal("2013-09-19", body.data[0].date);
    finish();
  });
};


exports.testSaveData = function(finish){
  process.env.FH_DB_PERAPP = true;
  process.env.FH_MONGODB_CONN_URL = "mongodb://127.0.0.1:27017/test";

  request({url: baseUrl + "saveData", method: 'POST', json: {"collection": "test", "document": {"name" : "testing"}}}, function(err, response, body){
    assert.ok(!err, 'Unexpected error: ', util.inspect(err));
    assert.equal(200, response.statusCode, 'Unexpected response: ' + util.inspect(response.body));
    finish();
  });
};

