// test
var _session = require('connect').session
  , debug = require('debug')('socket.io-bundle:session');


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
    var req = socket.request
      , res = req.res;

    req.originalUrl = req.originalUrl || req.url;

    // proxy `onconnect` to commit the session
    var onconnect = socket.onconnect;
    socket.onconnect = function() {
      if (!req.session) return onconnect.call(socket);
      debug('saving');
      req.session.resetMaxAge();
      req.session.save(function(err) {
        if (err) console.error(err.stack);
        debug('saved');
        onconnect.call(socket);
      });
    };

    return fn(req, res, next);
  };
};

