import type { ObjectEncodingDefinition } from './types.js'
import { ClipPlayerObject, ClipPlayerTMS } from '../kairos-types/clip-player.js'
import {
	parseEnum,
	parseInteger,
	parseBoolean,
	parseColorRGB,
	passThroughString,
	parseMediaClipRefOptional,
} from '../lib/data-parsers.js'

export const ClipPlayerObjectEncodingDefinition: ObjectEncodingDefinition<ClipPlayerObject> = {
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
	clip: { protocolName: 'clip', parser: parseMediaClipRefOptional },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
