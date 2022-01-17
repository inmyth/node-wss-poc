/* Non-SSL is simply App() */
require('uWebSockets.js')
  .App()
  .ws('/*', {
    /* There are many common helper features */
    idleTimeout: 30,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    open: (ws) => {
      /* Let this client listen to all sensor topics */
      console.log(ws)
      // ws.subscribe('home/sensors/#')
    },
    message: (ws, message, isBinary) => {
      /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */

      /* Here we echo the message back, using compression if available */
      let ok = ws.send(`server response ${new TextDecoder('utf-8').decode(message)}`, isBinary, true)
      console.log(message.toString())
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
