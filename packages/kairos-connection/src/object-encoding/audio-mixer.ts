import type { ObjectEncodingDefinition } from './types.js'
import { AudioMixerObject } from '../kairos-types/audio-mixer.js'
import { parseBoolean, parseFloatValue } from '../lib/data-parsers.js'

export const AudioMixerObjectEncodingDefinition: ObjectEncodingDefinition<AudioMixerObject> = {
	volume: { protocolName: 'volume', parser: parseFloatValue },
	mute: { protocolName: 'mute', parser: parseBoolean },
}
