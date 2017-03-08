var MongoClient = require('mongodb').MongoClient;
var fh = require('fh-mbaas-api');
var dbConn;
var _ = require('underscore');

/*
If this app has the env var "process.env.FH_DB_PERAPP" then a direct MongoDB connection is available (this can be enabled
from data browser UI in App Studio) This tells us whether we can connect to mongo directly or if we should use fh.db for
database actions
 */

//save the data into the db
exports.save = function(params, callback) {
  console.log(new Date() + ' - starting database save - process.env.FH_MONGODB_CONN_URL = ' + process.env.FH_MONGODB_CONN_URL);

  var saveCb = function(err, res) {
    console.log(new Date() + ' - finished database save');
    if( err ) {
      console.log('ERROR :: ', err);
    }
    callback(err, res);
  };

  var hasDirectConnUrl = !_.isUndefined(process.env.FH_MONGODB_CONN_URL);

  if (hasDirectConnUrl === true) {
    this.doDirectSave(params, saveCb)
  } else {
    this.doFhDbSave(params, saveCb);
  }
}

// Helper function for saving using MongoDB driver
exports.doDirectSave = function(params, cb) {
  console.log(new Date() + ' - Using direct database connection');
  var dbUrl = process.env.FH_MONGODB_CONN_URL;
  this.connectDB(dbUrl, function(err, conn) {
    if(err) return cb(err);

    var collection = params.collection;
    var doc = params.document;
    doc.created = new Date().getTime();
    var collection = conn.collection(collection);
    collection.insert(doc, function(err, docs){
      if(err){
        console.log(new Date() + ' - Failed to create data via direct MongoDB driver', err);
        return cb(err);
      }
      return cb(null, {'status': 'ok'});
    });
  });
};

// Helper function for saving using FeedHenry fh.db API
exports.doFhDbSave = function(params, cb) {
  console.log(new Date() + ' - Using fh.db connection');
  var collection = params.collection;
  var doc = params.document;
  doc.created = new Date().getTime();

  var options = {
    "act": "create",
    "type": collection,
    "fields": doc
  };
  fh.db(options, function (err, data) {
    if(err) {
      console.log(err.stack);
      console.log(new Date() + ' - Failed to create data via fh.db - ', err);
      return cb(err);
    }
    return cb(null, {'status': 'ok'});
  });
};

//setup direct mongo db connection
exports.connectDB = function(dbUrl, cb){
  if(_.isUndefined(dbConn)){
    console.log(new Date() + ' - dbUrl = ' + dbUrl);

    MongoClient.connect(dbUrl, function(err, db){
      if(err){
        console.log(new Date() + " - Failed to connect to MongoDB - ", err);
        dbConn = undefined;
        return cb(err, null);
      }
      dbConn = db;
      console.log(new Date() + " - Db connection established");
      return cb(null, dbConn);
    });
  } else {
    return cb(null, dbConn);
  }
};

exports.disconnectDB = function(cb) {
  if( !_.isUndefined(dbConn) ) {
    dbConn.close();
    dbConn = undefined;
  }

  if(_.isUndefined(process.env.FH_MONGODB_CONN_URL)) {
    // No direct DB connection, so try to close fh.db connection
    fh.db({'act': 'close'}, cb);
  } else {
    cb();
  }
}