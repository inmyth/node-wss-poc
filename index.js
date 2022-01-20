/* Non-SSL is simply App() */

var connector = null
var user = null
require('uWebSockets.js')
  .App()
  .ws('/*', {
    /* There are many common helper features */
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    open: (ws) => {
      /* Let this client listen to all sensor topics */
      console.log(ws)
      // ws.subscribe('home/sensors/#')
    },
    message: (ws, message, isBinary) => {
      let string = new TextDecoder('utf-8').decode(message)

      if (string === 'connector') {
        connector = ws
      } else if (string === 'user') {
        user = ws
      } else {
        let s = string.split(' ')
        if (s[0] === 'connector' && user != null && connector != null) {
          if (s[1] === 'millis') {
            let now = Date.now()
            let connectorTime = s[2]
            let trip = now - connectorTime
            console.log(`connector:${connectorTime} - local: ${now} = ${trip}`)
          } else {
            user.send(s.slice(1).join(' '))
          }
        } else if (s[0] === 'user' && user != null && connector != null) {
          let t1 = s[1] === 'BUY' || s[1] === 'SELL'
          let t2 = !isNaN(Number(s[2]))
          let t3 = !isNaN(Number(s[3]))
          if (t1 && t2 && t3) {
            connector.send(s.slice(1).join(' '))
            user.send(`Acknowledge ${s[1]}`)
          } else {
            user.send('Bad buy/sell command')
          }
        } else {
          if (user != null) {
            user.send('Bad command')
          }
        }
      }
    },
    close: (ws, code, message) => {
      console.log(`WebSocket closed: ${message}`)
    }
  })
  .get('/*', (res, req) => {
    /* It does Http as well */
    res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!')
  })
  .listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log('Listening to port 9001')
    }
  })
