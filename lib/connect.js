let wrtc = require('wrtc')
let DC = require('discovery-channel')
let { EventEmitter } = require('events')
let net = require('net')
let connectWrtc = require('./connect-wrtc.js')

function connect(name) {
  let dc = DC()
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
  bus.on('_close', function() {
    dc.destroy()
    while (dcPeers.length) {
      dcPeers.pop().destroy()
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
