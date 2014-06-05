# Socket.IO-bundle
[![Build Status](https://travis-ci.org/nkzawa/socket.io-bundle.png?branch=master)](https://travis-ci.org/nkzawa/socket.io-bundle)

This is a collection of commonly used middlewares for [Socket.IO](https://github.com/LearnBoost/socket.io), which I wish Socket.IO was bundled with.
Socket.IO-bundle is based on [Express](https://github.com/visionmedia/express) middlewares, so that you can easily integrate with Express and Connect.

```js
var bundle = require('socket.io-bundle');
var server = require('http').Server();
var io = require('socket.io')(server);

io.use(bundle.cookieParser());
io.use(bundle.session({secret: 'my secret here'}));
io.use(bundle.csrf());

server.listen(3000);
```

Arguments for each middlewares are completely the same with Express's ones.
You must be aware of that `session` middleware can’t set cookies to clients due to the behavior of Socket.I.

### CSRF

Csrf tokens will be supplied to browsers via Express/Connect, and be sent to a Socket.IO server as a query parameter.

```js
// client
var socket = io('http://localhost:3000?_csrf=' + encodeURIComponent(_csrf));
```

## License
MIT

