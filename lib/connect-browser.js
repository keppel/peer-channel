let connectWrtc = require('./connect-wrtc.js')
let { EventEmitter } = require('events')

module.exports = function(name) {
  let bus = new EventEmitter()
  connectWrtc(bus)(name)
  return bus
}
