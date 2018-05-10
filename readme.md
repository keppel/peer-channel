# peer-channel
create and connect to servers by name, in node or the browser.

## Usage
```js
let { createServer } = require('peer-channel')

// echo server
let server = createServer(function(peer) {
  peer.on('data', data => peer.send(data))
})

server.listen('abc123')

// client.js:
let { connect } = require('peer-channel')

let pc = connect('abc123')

pc.on('connection', function(peer) {
  peer.on('data', function(data) {
    console.log(data)
  })
  peer.send('hey')
})
```
