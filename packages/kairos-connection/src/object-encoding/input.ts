import type { ObjectEncodingDefinition } from './types.js'
import { parseBoolean, parseColorRGB, parseEnum, parseInteger } from '../lib/data-parsers.js'
import { InputObject, InputRecordingStatus } from '../kairos-types/input.js'

export const InputObjectEncodingDefinition: ObjectEncodingDefinition<InputObject> = {
	name: {
		protocolName: 'name',
		parser: (value) => value,
	},
	tally: {
		protocolName: 'tally',
		parser: parseInteger,
	},
	available: {
		protocolName: 'available',
		parser: parseBoolean,
	},
	recordingStatus: {
		protocolName: 'recording_status',
		parser: (value) => parseEnum<InputRecordingStatus>(value, InputRecordingStatus),
	},
	colorOverwrite: {
		protocolName: 'color_overwrite',
		parser: parseBoolean,
	},
	color: {
		protocolName: 'color',
		parser: (val) => parseColorRGB(val),
	},
}
