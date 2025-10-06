import type { ObjectEncodingDefinition } from './types.js'
import { GfxSceneHTMLElementItemObject, GfxSceneItemObject, GfxSceneObject, Resolution } from 'kairos-lib'
import { parseEnum, parseInteger, parsePos2D } from '../lib/data-parsers.js'

export const GfxSceneObjectEncodingDefinition: ObjectEncodingDefinition<GfxSceneObject> = {
	resolution: {
		protocolName: 'resolution',
		parser: (value) => parseEnum<Resolution>(value, Resolution),
	},
}

const GfxSceneItemObjectBaseEncodingDefinition = {
	height: {
		protocolName: 'height',
		parser: (value: string) => parseInteger(value),
	},
	width: {
		protocolName: 'width',
		parser: (value: string) => parseInteger(value),
	},
	position: {
		protocolName: 'position',
		parser: (value: string) => parsePos2D(value),
	},
}

export const GfxSceneItemObjectEncodingDefinition: ObjectEncodingDefinition<GfxSceneItemObject> = {
	...GfxSceneItemObjectBaseEncodingDefinition,
}

export const GfxSceneHTMLElementItemObjectEncodingDefinition: ObjectEncodingDefinition<GfxSceneHTMLElementItemObject> =
	{
		...GfxSceneItemObjectBaseEncodingDefinition,
		url: {
			protocolName: 'url',
			parser: (value) => value,
		},
	}
