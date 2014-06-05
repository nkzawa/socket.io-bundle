
var _cookieParser = require('cookie-parser');


module.exports = function cookieParser(secret) {
  var fn = _cookieParser(secret);

  return function cookieParser(socket, next) {
    var req = socket.request;
    var res = req.res;

    return fn(req, res, next);
  };
};
