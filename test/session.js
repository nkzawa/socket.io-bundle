var expect = require('chai').expect
  , signature = require('cookie-signature')
  , bundle = require('../')
  , support = require('./support')
  , client = support.client
  , sessionCookie = support.sessionCookie;


var min = 60 * 1000;

function sid(val) {
  if (!val) return '';
  return decodeURIComponent(/^connect\.sid=([^;]+);/.exec(val)[1]);
}

describe('session', function() {
  it('should export constructors', function(){
    expect(bundle.session.Session).to.be.a('function');
    expect(bundle.session.Store).to.be.a('function');
    expect(bundle.session.MemoryStore).to.be.a('function');
    expect(bundle.session.Cookie).to.be.a('function');
  })

  describe('acceptance', function() {
    beforeEach(support.startServer);
    afterEach(support.stopServer);

    describe('req.session', function() {
      it('should persist', function(done) {
        this.io
          .use(bundle.cookieParser())
          .use(bundle.session({ secret: 'keyboard cat', cookie: { maxAge: min, httpOnly: false }}))
          .use(function(socket, next){
            var req = socket.request;
            // checks that cookie options persisted
            expect(req.session.cookie.httpOnly).to.eql(false);

            req.session.count = req.session.count || 0;
            req.session.count++;
            next();
          })
          .on('connection', function(socket) {
            var req = socket.request;
            socket.send(req.session.count, sessionCookie(req, 'keyboard cat'));
          });

        var socket = client();
        socket.on('message', function(body, cookie) {
          expect(body).to.eql(1);

          socket = client('/', {headers: {cookie: cookie}});
          socket.on('message', function(body) {
            expect(body).to.eql(2);
            done()
          });
        });
      });

      it('should persist after disconnection', function(done) {
        this.io
          .use(bundle.cookieParser())
          .use(bundle.session({ secret: 'keyboard cat', cookie: { maxAge: min, httpOnly: false }}))
          .on('connection', function(socket) {
            socket.on('message', function(callback) {
              var req = socket.request
                , session = req.session;

              // checks that cookie options persisted
              expect(session.cookie.httpOnly).to.eql(false);

              session.count = session.count || 0;
              session.count++;

              callback(session.count, sessionCookie(req, 'keyboard cat'));
            });

            socket.on('_disconnect', function() {
              socket.disconnect(true);
            });
          });

        var socket1 = client();
        socket1.on('connect', function() {
          socket1.send(function(body, cookie) {
            expect(body).to.eql(1);

            socket1.on('disconnect', function() {
              var socket2 = client('/', {headers: {cookie: cookie}});
              socket2.on('connect', function() {
                socket2.send(function(body) {
                  expect(body).to.eql(2);
                  done();
                });
              });
            });
            socket1.emit('_disconnect');
          });
        });
      });

      describe('.regenerate()', function() {
        it('should destroy/replace the previous session', function(done) {
          this.io
            .use(bundle.cookieParser())
            .use(bundle.session({ secret: 'keyboard cat', cookie: { maxAge: min }}))
            .use(function(socket, next) {
              var req = socket.request
                , id = req.session.id;
              req.session.regenerate(function(err) {
                if (err) throw err;
                expect(id).not.to.eql(req.session.id);
                next();
              });
            })
            .on('connection', function(socket) {
              var req = socket.request;
              socket.send(sessionCookie(req, 'keyboard cat'));
            });

          var socket = client();
          socket.on('message', function(cookie) {
            var id = sid(cookie);

            var socket = client('/', {headers: {cookie: cookie}});
            socket.on('message', function(cookie) {
              expect(sid(cookie)).not.to.eql('');
              expect(sid(cookie)).not.to.eql(id);
              done();
            });
          });
        });
      });

      it('should support req.signedCookies', function(done) {
        this.io
          .use(bundle.cookieParser('keyboard cat'))
          .use(bundle.session())
          .use(function(socket, next) {
            var req = socket.request;
            req.session.count = req.session.count || 0;
            req.session.count++;
            next()
          })
          .on('connection', function(socket) {
            var req = socket.request;
            socket.send(req.session.count, sessionCookie(req, 'keyboard cat'));
          });

        var socket = client();
        socket.on('message', function(body, cookie) {
          expect(body).to.eql(1);

          socket = client('/', {headers: {cookie: cookie}});
          socket.on('message', function(body) {
            expect(body).to.eql(2);
            done()
          });
        });
      });
    });
  });
});


