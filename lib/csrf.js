
var _csrf = require('csurf');


/**
 * CSRF protection middleware.
 */

module.exports = function csrf(options) {
  var fn = _csrf(options);

  return function csrf(socket, next) {
    var req = socket.request;
    var res = req.res;
    var method = req.method;

    // A pseudo value to pass through the method check.
    req.method = 'POST';

    if (!req.query) req.query = req._query;

    return fn(req, res, function(err) {
      // put back
      req.method = method;
      delete req.query;

      next(err);
    });
  };
};

