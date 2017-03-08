//test app activity function
var assert = require('assert');
var util = require('util');
var proxyquire = require('proxyquire');
var globals = require('./global.js');

var activity = proxyquire("lib/activity.js", {'fh-mbaas-api':globals.fh});
var recordActivity = activity.record;
var listActivity = activity.list;
var setCacheKey = activity.setCacheKey;

exports.setUp = function(finish){
  globals.cacheData = {};
  finish();
};

exports.tearDown = function(finish){
  return finish();
};

exports.testActivity = function(finish){
  var testCacheKey = "test_activity_cache_key";
  setCacheKey(testCacheKey);

  listActivity({}, function(err, res){
    console.log('RES', res);
    assert.ok(!err, 'Unexpected error: ', util.inspect(err));
    assert.ok(res.activity);
    assert.equal(0, res.activity.length);
    recordActivity({action: "test1"}, function(err, res){
      assert.ok(!err, 'Unexpected error: ', util.inspect(err));
      listActivity({}, function(err, res){
        assert.ok(!err, 'Unexpected error: ', util.inspect(err));
        assert.ok(res.activity);
        assert.equal(1, res.activity.length);
        assert.equal('test1', res.activity[0].action);
        recordActivity({action: "test2"}, function(err, res){
          assert.ok(!err, 'Unexpected error: ', util.inspect(err));
          listActivity({}, function(err, res){
            assert.ok(!err, 'Unexpected error: ', util.inspect(err));
            assert.ok(res.activity);
            assert.equal(2, res.activity.length);
            assert.equal('test1', res.activity[0].action);
            assert.equal('test2', res.activity[1].action);
            finish();
          });
        });
      });
    });
  });
};

exports.testCacheError = function(finish) {
  var testCacheKey = "error";
  setCacheKey(testCacheKey);

  listActivity({}, function (err, res) {
    assert.ok(err);
    assert(err.indexOf('CACHE ERROR') > -1);
    assert.ok(!res);

    recordActivity({action: "test1"}, function (err, res) {
      assert.ok(err);
      assert(err.indexOf('CACHE ERROR') > -1);
      assert.ok(!res);
      finish();
    });
  });
}