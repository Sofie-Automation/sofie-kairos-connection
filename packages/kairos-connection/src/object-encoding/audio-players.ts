import type { ObjectEncodingDefinition } from './types.js'
import { AudioPlayerObject, MediaSoundRef, PlayerTMS } from 'kairos-lib'
import { parseBoolean, passThroughString, parseInteger, parseEnum, parseRefOptional } from '../lib/data-parsers.js'

export const AudioPlayerObjectEncodingDefinition: ObjectEncodingDefinition<AudioPlayerObject> = {
	timecode: { protocolName: 'timecode', parser: passThroughString },
	remainingTime: { protocolName: 'remaining_time', parser: passThroughString },
	position: { protocolName: 'position', parser: parseInteger },
	repeat: { protocolName: 'repeat', parser: parseBoolean },
	tms: {
		protocolName: 'tms',
		parser: (value) => parseEnum<PlayerTMS>(value, PlayerTMS),
	},
	clip: { protocolName: 'clip', parser: (v) => parseRefOptional<MediaSoundRef>('media-sound', v) },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
