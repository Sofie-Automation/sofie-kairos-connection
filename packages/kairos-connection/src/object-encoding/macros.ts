import type { ObjectEncodingDefinition } from './types.js'
import { MacroObject, MacroStatus } from '../kairos-types/macro.js'
import { parseEnum, parseColorRGB } from '../lib/data-parsers.js'

export const MacroObjectEncodingDefinition: ObjectEncodingDefinition<MacroObject> = {
	status: {
		protocolName: 'status',
		parser: (value) => parseEnum<MacroStatus>(value, MacroStatus),
	},
	color: { protocolName: 'color', parser: parseColorRGB },
}
