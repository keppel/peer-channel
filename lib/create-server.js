let wrtc = require('wrtc')
let DC = require('discovery-channel')
let createDiscoveryServer = require('discovery-server')
let startWrtcServer = require('./start-wrtc-server.js')
let getPort = require('get-port')

function createServer(handleConnection) {
  let wrtcServer, discoveryServer
  return {
    async listen(name) {
      discoveryServer = createDiscoveryServer(function(socket) {
        socket.send = socket.write
        handleConnection(socket)
      })
      discoveryServer.listen(name, await getPort(), function() {})
      wrtcServer = startWrtcServer(handleConnection, wrtc)(name)
    },

    close() {
      discoveryServer.close()
      wrtcServer.close()
    }
  }
}

module.exports = createServer
