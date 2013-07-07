var fs = require('fs')
  , path = require('path');


var _filename = path.basename(__filename);

fs.readdirSync(__dirname).forEach(function(filename) {
  if (filename == _filename) return;
  if (!/\.js$/.test(filename)) return;

  var name = path.basename(filename, '.js');
  exports.__defineGetter__(name, function() {
    return require('./' + name);
  });
});


