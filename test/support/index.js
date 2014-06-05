var http = require('http');
var url = require('url');
var io = require('socket.io');
var client = require('socket.io-client');
var connect = require('connect');
var signature = require('cookie-signature');
var port = 8888;


exports.client = function(path, options) {
  path = path || '/';
  options = options || {};

  var uri = 'http://localhost:' + port + path;
  var urlObj = url.parse(uri, true);
  if (options.headers) {
    urlObj.query.headers = JSON.stringify(options.headers);
    delete urlObj.search;
    uri = url.format(urlObj);
    delete options.headers;
  }

  var _options = {reconnection: false};
  for (var key in options) {
    _options[key] = options[key];
  }

  return client.Manager(uri, _options).socket(urlObj.pathname);
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
  var req = socket.request;
  var headers = req._query.headers;

  if (headers) {
    headers = JSON.parse(headers);
    for (var field in headers) {
      req.headers[field.toLowerCase()] = headers[field];
    }
  }
  next();
};

exports.sessionCookie = function(req, secret) {
  var cookie = req.session.cookie;
  var val = 's:' + signature.sign(req.sessionID, secret);

  return cookie.serialize('connect.sid', val);
};

