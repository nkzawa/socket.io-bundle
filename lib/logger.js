
var _logger = require('connect').logger;


exports = module.exports = logger;

/**
 * Expose properties.
 */

for (var key in _logger) {
  exports[key] = _logger[key];
}

/**
 * Logger
 */

function logger(options) {
  if ('object' == typeof options) {
    options = options || {};
  } else if (options) {
    options = { format: options };
  } else {
    options = {};
  }
  options.immediate = true;

  var fn = _logger(options);

  return function logger(socket, next) {
    var req = socket.request
      , res = req.res;

    req.originalUrl = req.originalUrl || req.url;

    return fn(req, res, next);
  };
}
