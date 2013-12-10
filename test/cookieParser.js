var expect = require('chai').expect
  , signature = require('cookie-signature')
  , bundle = require('../')
  , support = require('./support')
  , client = support.client;


describe('cookieParser', function() {
  beforeEach(function(done) {
    var self = this;

    support.startServer(this, function(e) {
      self.io.use(bundle.cookieParser('keyboard cat'));
      self.io.on('connection', function(socket) {
        socket.send(socket.request.cookies);
      });
      self.io.of('/signed').on('connection', function(socket) {
        socket.send(socket.request.signedCookies);
      });
      done(e);
    });
  });

  afterEach(function(done) {
    support.stopServer(this, done);
  });

  describe('when no cookies are sent', function() {
    it('should default req.cookies to {}', function(done) {
      var socket = client();
      socket.on('message', function(cookies) {
        expect(cookies).to.eql({});
        done();
      });
    });

    it('should default req.signedCookies to {}', function(done) {
      var socket = client('/signed');
      socket.on('message', function(signedCookies) {
        expect(signedCookies).to.eql({});
        done();
      });
    });
  });

  describe('when cookies are sent', function() {
    it('should populate req.cookies', function(done){
      var socket = client('/', {headers: {cookie: 'foo=bar; bar=baz'}});
      socket.on('message', function(cookies) {
        expect(cookies).to.eql({foo: 'bar', bar: 'baz'});
        done();
      });
    });
  });

  describe('when a secret is given', function() {
    var val = signature.sign('foobarbaz', 'keyboard cat');

    it('should populate req.signedCookies', function(done) {
      var socket = client('/signed', {headers: {cookie: 'foo=s:' + val}});
      socket.on('message', function(signedCookies) {
        expect(signedCookies).to.eql({foo: 'foobarbaz'});
        done();
      });
    });

    it('should remove the signed value from req.cookies', function(done) {
      var socket = client('/', {headers: {cookie: 'foo=s:' + val}});
      socket.on('message', function(cookies) {
        expect(cookies).to.eql({});
        done();
      });
    });

    it('should omit invalid signatures', function(done) {
      var socket = client('/signed', {headers: {cookie: 'foo=' + val + '3'}});
      socket.on('message', function(signedCookies) {
        expect(signedCookies).to.eql({});

        socket = client('/', {headers: {cookie: 'foo=' + val + '3'}});
        socket.on('message', function(cookies) {
          expect(cookies).to.eql({foo: 'foobarbaz.CP7AWaXDfAKIRfH49dQzKJx7sKzzSoPq7/AcBBRVwlI3'});
          done();
        });
      });
    });
  });
});


