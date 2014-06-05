/**
 * Module dependencies.
 */

var _session = require('express-session');
var debug = require('debug')('socket.io-bundle:session');


exports = module.exports = session;

/**
 * Expose constructors.
 */

for (var key in _session) {
  exports[key] = _session[key];
}

function session(options) {
  var fn = _session(options);

  return function session(socket, next) {
    var req = socket.request;
    var res = req.res;

    req.originalUrl = req.originalUrl || req.url;

    // proxy `onconnect` to commit the session.
    socket.onconnect = persist(socket.onconnect, req);

    return fn(req, res, next);
  };
}

/**
 * Decorator to save the given req's session.
 *
 * @param {Function} fn
 * @param {ServerRequest} req
 * @return {Function}
 * @api private
 */

function persist(fn, req) {
  return function() {
    if (!req.session) return fn.apply(this, arguments);

    var self = this;
    var args = arguments;

    debug('saving');
    req.session.resetMaxAge();
    req.session.save(function(err) {
      if (err) console.error(err.stack);
      debug('saved');
      fn.apply(self, args);
    });
  };
}
