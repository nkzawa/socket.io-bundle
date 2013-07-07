var expect = require('chai').expect
  , http = require('http')
  , connect = require('connect')
  , bundle = require('../')
  , support = require('./support')
  , client = support.client;


var sessionCookie = support.sessionCookie;

describe('csrf', function() {
  beforeEach(support.startServer);
  afterEach(support.stopServer);

  it('should work with a valid token', function(done) {
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.session._csrf || 'none');
    });

    var io = this.io;
    io.use(bundle.cookieParser())
    io.use(bundle.session({secret: 'greg', store: store}))
    io.use(bundle.csrf())

    http.request('http://localhost:8888', function(res) {
      var cookie = res.headers['set-cookie'][0]
        , body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var socket = client('/', {headers: {Cookie: cookie, 'X-CSRF-Token': body}});
        socket.once('connect', function() {
          done();
        });
      });
    }).end();
  });

  it('should fail with an invalid token', function(done) {
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.session._csrf || 'none');
    });

    var io = this.io;
    io.use(bundle.cookieParser())
    io.use(bundle.session({secret: 'greg', store: store}))
    io.use(bundle.csrf())

    http.request('http://localhost:8888', function(res) {
      var cookie = res.headers['set-cookie'][0];
      var socket = client('/', {headers: {Cookie: cookie, 'X-CSRF-Token': '42'}});
      socket.once('error', function(err) {
        expect(err).to.eql('Forbidden');
        done();
      });
    }).end();
  });

  it('should fail with no token', function(done){
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.session._csrf || 'none');
    });

    var io = this.io;
    io.use(bundle.cookieParser())
    io.use(bundle.session({secret: 'greg', store: store}))
    io.use(bundle.csrf())

    http.request('http://localhost:8888', function(res) {
      var cookie = res.headers['set-cookie'][0];
      var socket = client('/', {headers: {Cookie: cookie}});
      socket.once('error', function(err) {
        expect(err).to.eql('Forbidden');
        done();
      });
    }).end();
  });
});


