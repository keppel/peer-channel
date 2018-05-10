let { connect, createServer } = require('../index.js')

let pc = connect('abc123')

pc.on('connect', function(conn) {
  conn.on('data', function(data) {
    console.log(data.toString())
  })
  conn.send('hello from the client')
})
