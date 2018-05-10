let { connect, createServer } = require('../browser.js')

let pc = connect('abc123')
pc.on('connect', function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hey from a browser client')
})

let server = createServer(function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hey from a browser server')
})

server.listen('abc123')
