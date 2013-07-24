var expect = require('chai').expect
  , bundle = require('../')
  , support = require('./support')
  , client = support.client;


function MockStream() {
  this.data = [];
}

MockStream.prototype.write = function(str) {
  this.data.push(str);
};


function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

function formatToRegExp(format) {
  var re = escapeRegExp(format).replace(/\\:[a-z-]+(\\\[[a-z-]+\\\])?/g, '(.+)');
  return new RegExp(re);
}

describe('logger', function() {

  beforeEach(support.startServer);
  afterEach(support.stopServer);

  it('should write a log on connection', function(done) {
    var stream = new MockStream();
    this.io.use(bundle.logger({stream: stream}));
    this.io.on('connection', function(socket) {
      expect(stream.data.length).to.eql(1);
      expect(stream.data[0]).to.match(formatToRegExp(bundle.logger.default));
      done();
    });
    client();
  });
});


