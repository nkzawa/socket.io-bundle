var expect = require('chai').expect;
var http = require('http');
var connect = require('connect');
var bundle = require('../');
var support = require('./support');
var client = support.client;


describe('csrf', function() {
  var io, cookie, csrfToken;

  beforeEach(function(done) {
    var self = this;

    support.startServer(this, function() {
      var store = new bundle.session.MemoryStore();

      var app = self.app;
      app.use(connect.cookieParser());
      app.use(connect.session({secret: 'greg', store: store}));
      app.use(connect.csrf());
      app.use(function(req, res) {
        res.end(req.csrfToken() || 'none');
      });

      io = self.io;
      io.use(bundle.cookieParser())
      io.use(bundle.session({secret: 'greg', store: store}))
      io.use(bundle.csrf())

      http.request('http://localhost:8888', function(res) {
        cookie = res.headers['set-cookie'][0];
        csrfToken = '';

        res.on('data', function(chunk) {
          csrfToken += chunk;
        });

        res.on('end', done);
      }).end();
    });
  });

  afterEach(function(done) {
    support.stopServer(this, done);
  });

  it('should work with a valid token', function(done) {
    var socket = client('/', {headers: {Cookie: cookie, 'X-CSRF-Token': csrfToken}});
    socket.on('connect', done);
  });

  it('should work with a valid token via query', function(done) {
    var socket = client('/?_csrf=' + encodeURIComponent(csrfToken),
            {headers: {Cookie: cookie}});
    socket.on('connect', done);
  });

  it('should fail with an invalid token', function(done) {
    var socket = client('/?_csrf=42', {headers: {Cookie: cookie}});
    socket.once('error', function(err) {
      expect(err).to.eql('invalid csrf token');
      done();
    });
  });

  it('should fail with no token', function(done){
    var socket = client('/', {headers: {Cookie: cookie}});
    socket.once('error', function(err) {
      expect(err).to.eql('invalid csrf token');
      done();
    });
  });

  it('should keep the original method value', function(done) {
    io.on('connect', function(socket) {
      expect(socket.request.method).to.eql('GET');
      done();
    });

    client('/?_csrf=' + encodeURIComponent(csrfToken),
            {headers: {Cookie: cookie}});
  });
});


