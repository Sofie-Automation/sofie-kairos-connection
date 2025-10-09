import type { ObjectEncodingDefinition } from './types.js'
import { ClipPlayerObject, MediaClipRef, PlayerTMS } from 'kairos-lib'
import {
	parseEnum,
	parseInteger,
	parseBoolean,
	parseColorRGB,
	passThroughString,
	parseRefOptional,
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
		parser: (value) => parseEnum<PlayerTMS>(value, PlayerTMS),
	},
	clip: { protocolName: 'clip', parser: (v) => parseRefOptional<MediaClipRef>('media-clip', v) },
	tally: { protocolName: 'tally', parser: parseInteger },
	autoplay: { protocolName: 'autoplay', parser: parseBoolean },
}
