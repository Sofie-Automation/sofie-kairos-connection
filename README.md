# Sofie Kairos Connection Library

[![Node CI](https://github.com/Sofie-Automation/sofie-kairos-connection/actions/workflows/node.yaml/badge.svg)](https://github.com/Sofie-Automation/sofie-kairos-connection/actions/workflows/node.yaml)
[![NPM Version](https://img.shields.io/npm/v/kairos-connection?label=npm:kairos-connection)](https://www.npmjs.com/package/kairos-connection)
[![NPM Version](https://img.shields.io/npm/v/kairos-lib?label=npm:kairos-lib)](https://www.npmjs.com/package/kairos-lib)

This is the _KAIROS Connection_ library of the [**Sofie** TV Automation System](https://github.com/Sofie-Automation/Sofie-TV-automation/). The library is used for controlling Panasonic KAIROS devices.

## General Sofie System Information

- [_Sofie_ Documentation](https://sofie-automation.github.io/sofie-core/)
- [_Sofie_ Releases](https://sofie-automation.github.io/sofie-core/releases)
- [Contribution Guidelines](CONTRIBUTING.md)
- [License](LICENSE)

---

## Usage

This project is composed of a few different packages:

- [kairos-connection](./packages/kairos-connection/) - A library for connecting and communicating with Panasonic KAIROS devices.
- [kairos-lib](./packages/kairos-lib/) - A library of types and utilities for working with kairos-connection.

### Documentation

You can find the auto-generated type docs [here](https://sofie-automation.github.io/sofie-kairos-connection/).

The `kairos-connection` library is a library for communicating with the [Panasonic KAIROS](https://eu.connect.panasonic.com/se/sv/broadcast-proav/itip-centric-video-platform-kairos) video switchers using SPKCP (Simple Panasonic Kairos Control Protocol) / TCP.

### Version support

| Version | Status     | Notes                                                                                                                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0     | Compatible | Some commands not implemented                                                                                                                                          |
| 1.7     | Compatible | Some commands not implemented. <br> Properties not available in 1.7 are filled with default values. <br> Will throw errors if methods not available in 1.7 are called. |

### Example usage

```ts
import * as Kairos from 'kairos-connection'
const kairos = new Kairos.KairosConnection({
	host: '127.0.0.1',
	// port: 3005, // Optional, defaults to 3005
})

kairos.addListener('disconnect', () => console.log('Disconnected'))
kairos.addListener('error', (e) => console.log('Error', e))

kairos.addListener('connect', () => {
	console.log('Connected!')

	Promise.resolve().then(async () => {
		// List scenes and media clips:
		console.log(await kairos.listScenes())
		console.log(await kairos.listMediaClips())

		const refClipPlayer = Kairos.refClipPlayer(1)
		const refScene = Kairos.refScene(['Main'])
		const refSceneLayer = Kairos.refSceneLayer(refScene, ['Layer-1'])

		// Special method to load a clip into a clip player (and wait for it to be loaded):
		await kairos.loadClipPlayerClip(refClipPlayer, {
			clip: Kairos.refMediaClip(['My-Clip.mxf']),
			position: 0,
		})
		// Start playing the clip:
		await kairos.clipPlayerPlay(refClipPlayer)

		// Display the clip on a scene layer:
		await kairos.updateSceneLayer(refSceneLayer, {
			sourceA: refClipPlayer,
		})
	})
})
```
