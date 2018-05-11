# peer-channel
create and connect to servers by name, in node or the browser.

```bash
$ npm install peer-channel
```

## Usage

First create a server
```js
let { createServer } = require('peer-channel')

let server = createServer(function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hello from the server')
})

server.listen('abc123')

// server.close() to gracefully shut down the server
```

then connect to it like:

```js
let { connect } = require('peer-channel')

let pc = connect('abc123')

pc.on('connect', function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hello from the client')
})

// pc.close()
```


