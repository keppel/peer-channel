let wrtc = require('wrtc')
let DC = require('discovery-channel')
let createDiscoveryServer = require('discovery-server')
let defaults = require('dat-swarm-defaults')({ utp: false })
let startWrtcServer = require('./start-wrtc-server.js')
let getPort = require('get-port')

function createServer(handleConnection, asClient = false) {
  let wrtcServer, discoveryServer, pc
  return {
    async listen(name) {
      discoveryServer = createDiscoveryServer(defaults, function(socket) {
        socket.send = socket.write
        handleConnection(socket)
      })
      discoveryServer.listen(name, await getPort(), function() {})
      wrtcServer = startWrtcServer(handleConnection, wrtc)(name)

      if (!asClient) {
        let connect = require('./connect.js')
        pc = connect('client:::' + name, true)
        pc.on('connect', function(conn) {
          handleConnection(conn)
        })
      }
    },

    close() {
      discoveryServer.close()
      wrtcServer.close()
      if (pc) {
        pc.close()
      }
    }
  }
}

module.exports = createServer
