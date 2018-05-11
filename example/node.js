let { createServer } = require('../index.js')

let server = createServer(function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hello from the server')
})
server.listen('abc123')
