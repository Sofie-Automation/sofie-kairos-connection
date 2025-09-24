import type { ObjectEncodingDefinition } from './types.js'
import { parseEnum, parseInteger, parseBoolean, parseColorRGB } from '../lib/data-parsers.js'
import { FxInputObject, ScaleMode, Resolution } from 'kairos-lib'

export const FxInputObjectEncodingDefinition: ObjectEncodingDefinition<FxInputObject> = {
	name: {
		protocolName: 'name',
		parser: (value) => value,
	},

	colorOverwrite: {
		protocolName: 'color_overwrite',
		parser: parseBoolean,
	},
	color: {
		protocolName: 'color',
		parser: parseColorRGB,
	},
	// backgroundEnable: {
	// 	protocolName: 'background_enable',
	// 	parser: parseBoolean,
	// },
	// backgroundColor: {
	// 	protocolName: 'background_color',
	// 	parser: parseColorRGB,
	// },
	scaleMode: {
		protocolName: 'scale_mode',
		parser: (value) => parseEnum<ScaleMode>(value, ScaleMode),
	},
	resolution: {
		protocolName: 'resolution',
		parser: (value) => parseEnum<Resolution>(value, Resolution),
	},
	advancedResolutionControl: {
		protocolName: 'advanced_resolution_control',
		parser: parseBoolean,
	},
	resolutionX: {
		protocolName: 'resolution_x',
		parser: parseInteger,
	},
	resolutionY: {
		protocolName: 'resolution_y',
		parser: parseInteger,
	},
}
