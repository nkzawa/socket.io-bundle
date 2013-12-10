var expect = require('chai').expect
  , http = require('http')
  , connect = require('connect')
  , bundle = require('../')
  , support = require('./support')
  , client = support.client;


describe('csrf', function() {
  beforeEach(function(done) {
    support.startServer(this, done);
  });

  afterEach(function(done) {
    support.stopServer(this, done);
  });

  it('should work with a valid token', function(done) {
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.csrfToken() || 'none');
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
        socket.on('connect', done);
      });
    }).end();
  });

  it('should work with a valid token via query', function(done) {
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.csrfToken() || 'none');
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
        var socket = client('/?_csrf=' + encodeURIComponent(body),
                {headers: {Cookie: cookie}});
        socket.on('connect', done);
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
      res.end(req.csrfToken() || 'none');
    });

    var io = this.io;
    io.use(bundle.cookieParser())
    io.use(bundle.session({secret: 'greg', store: store}))
    io.use(bundle.csrf())

    http.request('http://localhost:8888', function(res) {
      var cookie = res.headers['set-cookie'][0];
      var socket = client('/?_csrf=42', {headers: {Cookie: cookie}});
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
      res.end(req.csrfToken() || 'none');
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

  it('should keep the original method value', function(done) {
    var store = new bundle.session.MemoryStore();

    var app = this.app;
    app.use(connect.cookieParser());
    app.use(connect.session({secret: 'greg', store: store}));
    app.use(connect.csrf());
    app.use(function(req, res) {
      res.end(req.csrfToken() || 'none');
    });

    var io = this.io
      , method;

    io.use(bundle.cookieParser())
    io.use(bundle.session({secret: 'greg', store: store}))
    io.use(function(socket, next) {
      method = socket.request.method;
      next();
    })
    io.use(bundle.csrf())
    io.use(function(socket, next) {
      expect(socket.request.method).to.eql(method);
      done();
    })

    http.request('http://localhost:8888', function(res) {
      var cookie = res.headers['set-cookie'][0]
        , body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var socket = client('/?_csrf=' + encodeURIComponent(body),
                {headers: {Cookie: cookie}});
        socket.on('connect', done);
      });
    }).end();
  });
});


