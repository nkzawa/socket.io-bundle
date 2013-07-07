
var _cookieParser = require('connect').cookieParser;


module.exports = function cookieParser(secret) {
  var fn = _cookieParser(secret);

  return function cookieParser(socket, next) {
    var req = socket.request
      , res = req.res;

    return fn(req, res, next);
  };
};
