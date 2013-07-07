
var connect = require('connect')
  , uid = require('connect/node_modules/uid2');


module.exports = function csrf(options) {
  options = options || {};
  var value = options.value || defaultValue;

  return function(socket, next) {
    var req = socket.request;

    // generate CSRF token
    var token = req.session._csrf || (req.session._csrf = uid(24));

    // determine value
    var val = value(req);

    // check
    if (val != token) return next(connect.utils.error(403));

    next();
  }
};


function defaultValue(req) {
  return (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token']);
}
