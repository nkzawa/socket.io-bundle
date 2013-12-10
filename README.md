# Socket.IO-bundle
[![Build Status](https://travis-ci.org/nkzawa/socket.io-bundle.png?branch=master)](https://travis-ci.org/nkzawa/socket.io-bundle)

This is a collection of commonly used middlewares for upcoming [Socket.IO 1.0](https://github.com/LearnBoost/socket.io), which I wish Socket.IO was bundled with.
Socket.IO-bundle is based on [Connect](https://github.com/senchalabs/connect), so that you can easily integrate with Express and Connect.

```js
var bundle = require('socket.io-bundle');
var server = require('http').Server();
var io = require('socket.io')(server);

io.use(bundle.cookieParser());
io.use(bundle.session({secret: 'my secret here'}));
io.use(bundle.csrf());

server.listen(3000);
```

## License
MIT

