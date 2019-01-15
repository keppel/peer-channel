let DC = require('discovery-channel')
let createDiscoveryServer = require('discovery-server')
let defaults = require('dat-swarm-defaults')({ utp: false })
let getPort = require('get-port')

function createServer(handleConnection, asClient = false) {
  let discoveryServer, pc
  return {
    async listen(name) {
      discoveryServer = createDiscoveryServer(defaults, function(socket) {
        socket.send = socket.write
        handleConnection(socket)
      })
      discoveryServer.listen(name, await getPort(), function() {})

      if (!asClient) {
        let connect = require('./connect.js')
        pc = connect(
          'client:::' + name,
          true
        )
        pc.on('connect', function(conn) {
          handleConnection(conn)
        })
      }
    },

    close() {
      discoveryServer.close()
      if (pc) {
        pc.close()
      }
    }
  }
}

module.exports = createServer
