import { ImageStoreScaleMode, type ImageStoreObject, DissolveMode, Resolution } from 'kairos-lib'
import type { ObjectEncodingDefinition } from './types.js'
import { parseBoolean, parseColorRGB, parseEnum, parseImageStoreClip, parseInteger } from '../lib/data-parsers.js'

export const ImageStoreObjectEncodingDefinition: ObjectEncodingDefinition<ImageStoreObject> = {
	colorOverwrite: { protocolName: 'color_overwrite', parser: parseBoolean },
	color: { protocolName: 'color', parser: parseColorRGB },
	clip: { protocolName: 'clip', parser: parseImageStoreClip },
	tally: { protocolName: 'tally', parser: parseInteger },
	dissolveEnabled: { protocolName: 'dissolve_enabled', parser: parseBoolean },
	dissolveTime: { protocolName: 'dissolve_time', parser: parseInteger },
	dissolveMode: { protocolName: 'dissolve_mode', parser: (value) => parseEnum<DissolveMode>(value, DissolveMode) },
	removeSourceAlpha: { protocolName: 'remove_source_alpha', parser: parseBoolean },
	scaleMode: {
		protocolName: 'scale_mode',
		parser: (value) => parseEnum<ImageStoreScaleMode>(value, ImageStoreScaleMode),
	},
	resolution: { protocolName: 'resolution', parser: (value) => parseEnum<Resolution>(value, Resolution) },
	advancedResolutionControl: { protocolName: 'advanced_resolution_control', parser: parseBoolean },
	resolutionX: { protocolName: 'resolution_x', parser: parseInteger },
	resolutionY: { protocolName: 'resolution_y', parser: parseInteger },
}
