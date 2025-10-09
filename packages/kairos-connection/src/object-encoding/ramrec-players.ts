import type { ObjectEncodingDefinition } from './types.js'
import type { RamRecPlayerObject } from 'kairos-lib'
import {
	parseBoolean,
	parseColorRGB,
	passThroughString,
	parseInteger,
	parseEnum,
	parseRefOptional,
} from '../lib/data-parsers.js'
import { MediaRamRecRef, PlayerTMS } from '../main.js'

export const RamRecPlayerObjectEncodingDefinition: ObjectEncodingDefinition<RamRecPlayerObject> = {
	colorOverwrite: { protocolName: 'color_overwrite', parser: parseBoolean },
	color: { protocolName: 'color', parser: parseColorRGB },
	timecode: { protocolName: 'timecode', parser: passThroughString },
	remainingTime: { protocolName: 'remaining_time', parser: passThroughString },
	position: { protocolName: 'position', parser: parseInteger },
	repeat: { protocolName: 'repeat', parser: parseBoolean },
	tms: {
		protocolName: 'tms',
		parser: (value) => parseEnum<PlayerTMS>(value, PlayerTMS),
	},
	clip: { protocolName: 'clip', parser: (v) => parseRefOptional<MediaRamRecRef>('media-ramrec', v) },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
