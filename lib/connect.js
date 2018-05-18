let wrtc = require('wrtc')
let DC = require('discovery-channel')
let { EventEmitter } = require('events')
let net = require('net')
let defaults = require('dat-swarm-defaults')({ utp: false })
let connectWrtc = require('./connect-wrtc.js')

function connect(name, asServer = false) {
  let dc = DC(defaults)
  let bus = new EventEmitter()
  let dcPeers = []
  dc.on('peer', function(key, peer) {
    let socket = net.connect(peer.port, peer.host)
    socket.send = socket.write
    socket.on('error', function() {
      socket.destroy()
    })
    dcPeers.push(socket)
    bus.emit('connect', socket)
  })

  let server
  if (!asServer) {
    let createServer = require('./create-server.js')
    server = createServer(function(conn) {
      bus.emit('connect', conn)
    }, true)
    server.listen('client:::' + name)
  }

  bus.on('_close', function() {
    dc.destroy()
    while (dcPeers.length) {
      dcPeers.pop().destroy()
    }
    if (server) {
      server.close()
    }
  })
  dc.join(name)

  connectWrtc(bus, wrtc)(name)

  bus.close = function() {
    bus.emit('_close')
  }

  return bus
}

module.exports = connect
