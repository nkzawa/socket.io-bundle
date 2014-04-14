
var _csrf = require('csurf');


/**
 * CSRF protection middleware.
 */

module.exports = function csrf(options) {
  var fn = _csrf(options);

  return function csrf(socket, next) {
    var req = socket.request
      , res = req.res
      , method = req.method;

    // A pseudo value to pass through the method check.
    req.method = 'POST';

    return fn(req, res, function(err) {
      // put back
      req.method = method;

      next(err);
    });
  };
};

