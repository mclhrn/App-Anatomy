var express = require('express');
var mbaasApi = require('fh-mbaas-api');
var mbaasExpress = mbaasApi.mbaasExpress();

// Securable endpoints: list the endpoints which you want to make securable here
var securableEndpoints = ['hello'];

var app = express();
// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());
app.use('/cloud', require('lib/cloud.js')());

app.use('/', function(req, res){
  res.end('Your Cloud App is Running');
});

app.use(mbaasExpress.errorHandler());

var server;

exports.setUp = function(finish){
  var port = 8052;
  server = app.listen(port, function(){
    console.log("App started at: " + new Date() + " on port: " + port);
    finish();
  });
};

exports.tearDown = function(finish) {
  if (server) {
    server.close(function() {

      // close down database connection
      require('lib/databrowser.js').disconnectDB(function () {

        // Ensure mBass API shuts down cleanly.
        mbaasApi.shutdown(function() {
          finish();
        })
      });;
    });
  }
};
