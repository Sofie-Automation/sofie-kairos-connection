import type { ObjectEncodingDefinition } from './types.js'
import { ColorBarSourceObject, ColorCircleSourceObject, MultiViewSourceObject } from 'kairos-lib'
import { parseBoolean, parseString } from '../lib/data-parsers.js'

export const ColorBarSourceObjectEncodingDefinition: ObjectEncodingDefinition<ColorBarSourceObject> = {
	name: { protocolName: 'name', parser: parseString },
}
export const ColorCircleSourceObjectEncodingDefinition: ObjectEncodingDefinition<ColorCircleSourceObject> = {
	name: { protocolName: 'name', parser: parseString },
}
export const MultiViewSourceObjectEncodingDefinition: ObjectEncodingDefinition<MultiViewSourceObject> = {
	available: { protocolName: 'available', parser: parseBoolean },
	name: { protocolName: 'name', parser: parseString },
}
