import type { ObjectEncodingDefinition } from './types.js'
import { AudioPlayerObject, ClipPlayerTMS } from 'kairos-lib'
import {
	parseBoolean,
	passThroughString,
	parseInteger,
	parseEnum,
	parseMediaSoundRefOptional,
} from '../lib/data-parsers.js'

export const AudioPlayerObjectEncodingDefinition: ObjectEncodingDefinition<AudioPlayerObject> = {
	timecode: { protocolName: 'timecode', parser: passThroughString },
	remainingTime: { protocolName: 'remaining_time', parser: passThroughString },
	position: { protocolName: 'position', parser: parseInteger },
	repeat: { protocolName: 'repeat', parser: parseBoolean },
	tms: {
		protocolName: 'tms',
		parser: (value) => parseEnum<ClipPlayerTMS>(value, ClipPlayerTMS),
	},
	clip: { protocolName: 'clip', parser: parseMediaSoundRefOptional },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
