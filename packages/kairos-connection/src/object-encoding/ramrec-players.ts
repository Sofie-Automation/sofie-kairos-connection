import type { ObjectEncodingDefinition } from './types.js'
import { RamRecPlayerObject } from '../kairos-types/ramrec-player.js'
import {
	parseBoolean,
	parseColorRGB,
	passThroughString,
	parseInteger,
	parseEnum,
	parseMediaRamRecRefOptional,
} from '../lib/data-parsers.js'
import { ClipPlayerTMS } from '../main.js'

export const RamRecPlayerObjectEncodingDefinition: ObjectEncodingDefinition<RamRecPlayerObject> = {
	colorOverwrite: { protocolName: 'color_overwrite', parser: parseBoolean },
	color: { protocolName: 'color', parser: parseColorRGB },
	timecode: { protocolName: 'timecode', parser: passThroughString },
	remainingTime: { protocolName: 'remaining_time', parser: passThroughString },
	position: { protocolName: 'position', parser: parseInteger },
	repeat: { protocolName: 'repeat', parser: parseBoolean },
	tms: {
		protocolName: 'tms',
		parser: (value) => parseEnum<ClipPlayerTMS>(value, ClipPlayerTMS),
	},
	clip: { protocolName: 'clip', parser: parseMediaRamRecRefOptional },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
