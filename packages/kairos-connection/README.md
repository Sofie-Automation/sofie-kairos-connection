# KAIROS-connection

_Note: This library is not affiliated with Panasonic in any way._

This is a library for communicating with the Panasonic KAIROS video switchers.

More documentation can be found here: [github.com/Sofie-Automation/sofie-kairos-connection](https://github.com/Sofie-Automation/sofie-kairos-connection)


## Usage

```typescript
const kairos = new KairosConnection()
kairos.on('connect', () => console.log('Connected to Kairos'))
kairos.on('disconnect', () => console.log('Disconnected from Kairos'))
kairos.on('error', (e) => console.error(e))
kairos.on('warn', (e) => console.log(e))
kairos.on('reset', () => {
    // Emitted when the kairos has been reset (like when restarted or new configuration loaded)
})

kairos.connect(host, port)

// Send commands:
await kairos.updateScene(ref, values)
// etc...

// Terminate:
kairos.disconnect()
kairos.discard()
kairos.removeAllListeners()
```
