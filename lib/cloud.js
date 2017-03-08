//customize app cloud logic, all the public functions defined here will be accessible using the url:
//http://<host>/cloud/<function name>

var fh = require('fh-mbaas-api');
var getWeather = require('./weather').getWeather;
var db = require('./databrowser');
var activity = require('./activity');
var util = require('util');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

function cloudRoute() {
  var cloud = new express.Router();
  cloud.use(cors());
  cloud.use(bodyParser());

  cloud.post('/hello', function(req, res) {
    activity.record({
      "action": "Client called Cloud App"
    }, function(err, docs) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      // see http://expressjs.com/4x/api.html#res.json
      res.json({
        text: 'Hello from FeedHenry'
      });
    });
  });


  cloud.post('/getWeather', function(req, res) {
    activity.record({
      "action": "Cloud Weather Called"
    }, function(err, docs) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      getWeather(req.body, function(err, data) {
        if (err) {
          res.statusCode = 500;
          return res.end(util.inspect(err));
        }
        res.json(data);
      });
    });
  });


  cloud.post('/saveData', function(req, res) {
    activity.record({
      "action": "Save Data in Cloud"
    }, function(err, docs) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      db.save(req.body, function(err, data) {
        if (err) {
          res.statusCode = 500;
          return res.end(util.inspect(err));
        }
        res.json(data);
      });
    });
  });

  cloud.post('/listActivity', function(req, res) {
    activity.list(req.body, function(err, data) {
      if (err) {
        res.statusCode = 500;
        return res.end(util.inspect(err));
      }
      res.json(data);
    });
  });

  cloud.post('/recordActivity', function(req, res) {
    activity.record({
      "action": "Record Activity Called"
    }, function(err, data) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      res.json(data);
    });
  });

  cloud.post('/getTime', function(req, res) {
    activity.record({
      "action": "Get Time Called"
    }, function(err, docs) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      res.json({
        time: new Date().getTime()
      });
    });
  });

  cloud.post('/getFhVars', function(req, res) {
    activity.record({
      "action": "Get FhVars Called"
    }, function(err, docs) {
      if (err) console.error('Warning: ignoring error: ' + util.inspect(err));
      res.json({
        'appName': process.env.FH_APPNAME,
        'domain': process.env.FH_DOMAIN,
        'env': process.env.FH_ENV,
        'port': process.env.FH_PORT
      });
    });
  });

  return cloud;
};


module.exports = cloudRoute;