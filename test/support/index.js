var http = require('http')
  , url = require('url')
  , io = require('socket.io')
  , client = require('socket.io-client')
  , connect = require('connect')
  , signature = require('cookie-signature')
  , port = 8888;


exports.client = function(path, options) {
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

  return client(uri, _options);
};

exports.startServer = function(context, done) {
  context.app = connect();
  context.server = http.Server(context.app);
  context.io = io(context.server);

  context.io.use(exports.header);
  context.server.listen(port, done);

  context.sockets = [];
  context.server.on('connection', function(socket) {
    context.sockets.push(socket);
  });
};

exports.stopServer = function(context, done) {
  // FIXME: following doesn't work when error.
  // this.io.sockets.sockets.slice().forEach(function(socket) {
  //   socket.disconnect(true);
  // });

  context.sockets.forEach(function(socket) {
    socket.destroy();
  });
  context.server.close(done);
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

