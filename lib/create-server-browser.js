let startWrtcServer = require('./start-wrtc-server.js')

function createServer(handleConnection) {
  let wrtcServer
  return {
    async listen(name) {
      wrtcServer = startWrtcServer(handleConnection)(name)
    },
    close() {
      wrtcServer.close()
    }
  }
}

module.exports = createServer
