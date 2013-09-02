var http = require('http')
  , url = require('url')
  , server = require('socket.io')
  , io = require('socket.io-client')
  , connect = require('connect')
  , signature = require('cookie-signature')
  , port = 8888;


exports.client = function client(path, options) {
  path = path || '';
  options = options || {};

  var uri = 'http://localhost:' + port + path;
  if (options.headers) {
    var urlObj = url.parse(uri, true);
    urlObj.query.headers = JSON.stringify(options.headers);
    delete urlObj.search;
    uri = url.format(urlObj);
    delete options.headers;
  }

  var _options = {
    forceNew: true,
    reconnection: false
  };
  for (var key in options) {
    _options[key] = options[key];
  }

  return io(uri, _options);
};

exports.startServer = function(done) {
  this.app = connect();
  this.server = http.Server(this.app);
  this.io = server(this.server);
  this.io.use(exports.header);
  this.server.listen(port, done);

  var self = this;

  this.sockets = [];
  this.server.on('connection', function(sockets) {
    self.sockets.push(sockets);
  });
};

exports.stopServer = function(done) {
  // FIXME: following doesn't work when error.
  // this.io.sockets.sockets.slice().forEach(function(socket) {
  //   socket.disconnect(true);
  // });

  this.sockets.forEach(function(socket) {
    socket.destroy();
  });
  this.server.close(done);
};

exports.header = function(socket, next) {
  var req = socket.request
    , headers = req.query.headers;

  if (headers) {
    headers = JSON.parse(headers);
    for (var field in headers) {
      req.headers[field.toLowerCase()] = headers[field];
    }
  }
  next();
};

exports.sessionCookie = function(req, secret) {
  var cookie = req.session.cookie
    , val = 's:' + signature.sign(req.sessionID, secret);
  return cookie.serialize('connect.sid', val);
};
