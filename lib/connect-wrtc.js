let signalhub = require('signalhub')
let Peer = require('simple-peer')
let defaultSeeds = require('./default-seeds.js')
let cuid = require('cuid')
let { EventEmitter } = require('events')
let through = require('through2')

module.exports = function(bus, wrtc) {
  return function connect(name) {
    let uuid = cuid()
    let hub = signalhub(name, defaultSeeds)
    let peerIds = new Set()
    let peers = []

    bus.on('_close', function() {
      // unsubscribe from new peers
      hub.close()

      // destroy all existing peers
      while (peers.length) {
        peers.pop().destroy()
      }

      bus.removeAllListeners()
    })

    hub.subscribe(uuid).pipe(
      through.obj(function(data, enc, cb) {
        if (typeof data === 'object' && data.offer && data.uuid) {
          let peer = new Peer({
            wrtc,
            initiator: false,
            trickle: false
          })
          peers.push(peer)
          peer.on('connect', function() {
            bus.emit('connect', peer)
          })
          peer.on('signal', function(offer) {
            hub.broadcast(data.uuid + uuid, { offer, uuid })
          })
          peer.on('error', function() {})
          peer.signal(data.offer)
        }
        cb()
      })
    )

    // announce self whenever a new server comes online
    hub.subscribe(name).on('data', data => {
      if (
        typeof data === 'object' && data.uuid !== uuid && data.type === 'server'
      ) {
        hub.broadcast(name, { uuid })
      }
    })

    hub.broadcast(name, { uuid })
    return bus
  }
}
