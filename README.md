# Development

See [Cloud Development](http://docs.feedhenry.com/v2/cloud_development.html) page about how to develop cloud app.

# Tests

All the tests are in the "tests/" directory. The cloud app is using Whiskey as the test runner. 

The main benefit of using Whiskey is that it can manage the dependencies used by the cloud app (e.g. MongoDb, Redis) when running the tests. See the tests/dependencies.json file for how to setup.

To run the tests, using the following commands:

    npm install -g whiskey

    #run integration tests
    make test

    #run acceptance tests
    make accept