let signalhub = require('signalhub')
let Peer = require('simple-peer')
let defaultSeeds = require('./default-seeds.js')
let cuid = require('cuid')
let through = require('through2')

module.exports = function(handleConnection, wrtc) {
  return function(name) {
    let uuid = cuid()
    let hub = signalhub(name, defaultSeeds)
    let peerIds = new Set()
    let peers = []
    hub.broadcast(name, { uuid, type: 'server' })
    hub.subscribe(name).pipe(
      through.obj(function(initialRequest, enc, next) {
        next()
        if (
          typeof initialRequest === 'object' &&
          initialRequest.uuid &&
          initialRequest.uuid !== uuid &&
          initialRequest.type !== 'server' &&
          !peerIds.has(initialRequest.uuid)
        ) {
          peerIds.add(initialRequest.uuid)
          let peer = new Peer({
            wrtc,
            initiator: true,
            trickle: false
          })
          peers.push(peer)
          peer.on('error', function(err) {
            peerIds.delete(initialRequest.uuid)
          })
          peer.on('close', function() {
            peerIds.delete(initialRequest.uuid)
          })
          peer.once('signal', function(offer) {
            hub
              .subscribe(uuid + initialRequest.uuid)
              .on('data', function(answerData) {
                if (
                  typeof answerData === 'object' &&
                  answerData.uuid &&
                  answerData.offer &&
                  answerData.uuid === initialRequest.uuid
                ) {
                  peer.on('connect', function() {
                    handleConnection(peer)
                  })
                  // don't signal if peer already disconnected
                  if (peerIds.has(initialRequest.uuid)) {
                    peer.signal(answerData.offer)
                  }
                }
              })
            hub.broadcast(initialRequest.uuid, { uuid, offer })
          })
        }
      })
    )

    return {
      close() {
        hub.close()
        while (peers.length) {
          peers.pop().destroy()
        }
      }
    }
  }
}
