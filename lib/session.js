
var _session = require('connect').session
  , debug = require('debug')('socket.io-bundle:session');


exports = module.exports = session;

/**
 * Expose constructors.
 */
for (var key in _session) {
  exports[key] = _session[key];
}

function session(secret) {
  var fn = _session(secret);

  return function session(socket, next) {
    var req = socket.request
      , res = req.res;

    req.originalUrl = req.originalUrl || req.url;

    // proxy `onconnect` to commit the session
    var onconnect = socket.onconnect;
    socket.onconnect = function() {
      socket.onconnect = onconnect;
      if (!req.session) return;
      debug('saving');
      req.session.resetMaxAge();
      req.session.save(function(err) {
        if (err) console.error(err.stack);
        debug('saved');
        socket.onconnect();
      });
    };

    return fn(req, res, next);
  };
};

