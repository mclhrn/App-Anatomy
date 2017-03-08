var fh = require('fh-mbaas-api');

//record app activities in the cache
var key = 'user_activity';

exports.setCacheKey = function(cacheKey){
  key = cacheKey;
};

exports.record = function(params, callback) {
  var activity = {
    created: new Date().getTime(),
    action: params.action
  };

  // Load current
  fh.cache({
    act: "load",
    key: key
  }, function(err, res) {
    if (err) return callback(err, null);

    //console.log('loaded, current: ', res);
    var current_activity = JSON.parse(res);
    if (current_activity) {
      current_activity.push(activity);
    } else {
      // First time
      current_activity = [activity];
    }

    fh.cache({
      act: "save",
      key: key,
      value: JSON.stringify(current_activity)
    }, function(err, res) {
      if (err) return callback(err, null);

      //console.log('saved, current: ', res);
      return callback(null, {
        'status': 'ok'
      });
    });
  });
};

exports.list = function(params, callback) {
  // Load current
  fh.cache({
    act: "load",
    key: key
  }, function(err, res) {
    if (err) return callback(err, null);

    //console.log('loaded, current: ', res);
    var current_activity = JSON.parse(res);
    if(null === current_activity) {
      current_activity = [];
    }
    var res = {
      activity: current_activity,
      time: new Date().getTime()
    };
    return callback(null, res);
  });
};