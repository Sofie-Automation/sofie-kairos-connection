import type { ObjectEncodingDefinition } from './types.js'
import { AudioPlayerObject } from '../kairos-types/audio-player.js'
import { ClipPlayerObjectEncodingDefinition } from './clip-players.js'

export const AudioPlayerObjectEncodingDefinition: ObjectEncodingDefinition<AudioPlayerObject> = {
	timecode: ClipPlayerObjectEncodingDefinition.timecode,
	remainingTime: ClipPlayerObjectEncodingDefinition.remainingTime,
	position: ClipPlayerObjectEncodingDefinition.position,
	repeat: ClipPlayerObjectEncodingDefinition.repeat,
	tms: ClipPlayerObjectEncodingDefinition.tms,
	clip: ClipPlayerObjectEncodingDefinition.clip,
	tally: ClipPlayerObjectEncodingDefinition.tally,
	autoplay: ClipPlayerObjectEncodingDefinition.autoplay,
}
