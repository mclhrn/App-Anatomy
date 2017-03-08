//test databrowser function
var proxyquire = require('proxyquire');
var assert = require('assert');
var util = require('util');
var sinon = require('sinon');
var globals = require('./global.js');

var COLLECTION = "testOnly";
var CONNECT_ERROR = "CONNECT ERROR";
var INSERT_ERROR = "INSERT ERROR";


var mongodb = {
  MongoClient: {
    connect: function (url, cb) {
      if( "error" === url) {
        return cb(CONNECT_ERROR);
      }
      else {
        return cb(null, {
          collection: function (collection) {
            return {
              insert: function (doc, cb) {
                if(doc.name && "error" === doc.name) {
                  return cb(INSERT_ERROR);
                } else {
                  return cb(null, {});
                }
              }
            };
          },
          close: function() {
            console.log('Closing Mock DB connection');
          }
        });
      }
    }
  }
};

var databrowser = proxyquire('lib/databrowser.js', {'mongodb': mongodb, 'fh-mbaas-api': globals.fh});

exports.setUp = function(finish) {
  return finish();
}

exports.tearDown = function(finish) {
  return finish();
}

exports.testSave = function(finish) {

  var params = {
    collection: COLLECTION,
    document: {
      name: 'test'
    }
  };

  var directSave = sinon.spy(databrowser, 'doDirectSave');
  var fhdbSave = sinon.spy(databrowser, 'doFhDbSave');
  var connectDB = sinon.spy(databrowser, 'connectDB');
  var disconnectDB = sinon.spy(databrowser, 'disconnectDB');

  databrowser.save(params, function(err, res) {

    assert.equal(1, fhdbSave.callCount);
    assert.equal(0, directSave.callCount);
    assert.equal(0, connectDB.callCount);
    assert.equal(0, disconnectDB.callCount);

    assert.ok(!err, 'Unexpected error: ', util.inspect(err));
    assert.ok(res);
    assert.equal("ok", res.status)

    process.env.FH_MONGODB_CONN_URL = 'ok';

    databrowser.save(params, function(err, res) {

      assert.equal(1, fhdbSave.callCount);
      assert.equal(1, directSave.callCount);
      assert.equal(1, connectDB.callCount);
      assert.equal(0, disconnectDB.callCount);

      assert.ok(!err, 'Unexpected error: ', util.inspect(err));
      assert.ok(res);
      assert.equal("ok", res.status)

      // call save again to test returning existing DB connection
      databrowser.save(params, function(err, res) {

        assert.equal(1, fhdbSave.callCount);
        assert.equal(2, directSave.callCount);
        assert.equal(2, connectDB.callCount);
        assert.equal(0, disconnectDB.callCount);

        assert.ok(!err, 'Unexpected error: ', util.inspect(err));
        assert.ok(res);
        assert.equal("ok", res.status)

        directSave.restore();
        fhdbSave.restore();
        connectDB.restore();
        disconnectDB.restore();

        finish();
      });
    });
  });
}

exports.testErrors = function(finish) {
  var params = {
    collection: COLLECTION,
    document: {
      name: 'error'
    }
  };

  var directSave = sinon.spy(databrowser, 'doDirectSave');
  var fhdbSave = sinon.spy(databrowser, 'doFhDbSave');
  var connectDB = sinon.spy(databrowser, 'connectDB');
  var disconnectDB = sinon.spy(databrowser, 'disconnectDB');

  delete process.env.FH_MONGODB_CONN_URL;

  // Disconnect from the DB so we can test an error connection
  databrowser.disconnectDB(function () {
    assert.equal(1, disconnectDB.callCount);

    databrowser.save(params, function (err, res) {
      assert.equal(1, fhdbSave.callCount);
      assert.equal(0, directSave.callCount);
      assert.equal(0, connectDB.callCount);
      assert.equal(1, disconnectDB.callCount);

      assert.ok(err);
      assert(err.indexOf('CREATE ERROR') > -1);
      assert.ok(!res);

      // Ensure we route through direct DB connection
      // Use a specially crafted URL which the MongoDB mock understands to test the error handler
      process.env.FH_MONGODB_CONN_URL = "error";

      databrowser.save(params, function (err, res) {

        assert.equal(1, fhdbSave.callCount);
        assert.equal(1, directSave.callCount);
        assert.equal(1, connectDB.callCount);

        assert.ok(err);
        assert.equal(CONNECT_ERROR, err);
        assert.ok(!res);

        databrowser.disconnectDB(function () {
          assert.equal(2, disconnectDB.callCount);

          process.env.FH_MONGODB_CONN_URL = "ok";

          databrowser.save(params, function (err, res) {
            assert.equal(1, fhdbSave.callCount);
            assert.equal(2, directSave.callCount);
            assert.equal(2, connectDB.callCount);

            assert.ok(err);
            assert(err.indexOf(INSERT_ERROR) > -1);
            assert.ok(!res);

            directSave.restore();
            fhdbSave.restore();
            connectDB.restore();
            disconnectDB.restore();

            finish();
          });
        });
      });
    });
  });
}