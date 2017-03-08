exports.setUp = function(finish){
  console.log('*** GLOBAL Setup ***');
  finish();
};

exports.tearDown = function(finish){
  console.log('*** GLOBAL Teardown ***');
  require('fh-mbaas-api').shutdown(function() {
    return finish();
  });
};

exports.cacheData = cacheData = {};
exports.fh = {
  cache: function(params, cb) {
    if( params.key && "error" === params.key) {
      // Support testing error conditions
      process.nextTick(function() {
        return cb("CACHE ERROR");
      });
    }
    else if( "load" === params.act) {
      process.nextTick(function() {
        return cb(null, cacheData[params.key] || null);
      });
    }
    else if( "save" === params.act) {
      process.nextTick(function() {
        cacheData[params.key] = params.value;
        return cb(null, cacheData[params.key]);
      });
    }
    else if( "remove" == params.act) {
      process.nextTick(function() {
        delete cacheData[params.key];
        return cb();
      });
    }
    else if( "close" == params.act) {
      process.nextTick(function() {
        return cb();
      });
    }
    else {
      process.nextTick(function() {
        return cb('Unknown action');
      });
    }
  },
  db: function(params, cb) {
    // Support returning a create error
    if( params && params.act && params.act === "create" && params.fields && params.fields.name && params.fields.name === "error") {
      return cb("CREATE ERROR");
    }
    return cb();
  }
};