import type { ObjectEncodingDefinition } from './types.js'
import { EffectFilmLookObject, EffectFilmLookColorMode, EffectGlowEffectObject } from '../kairos-types/effects.js'
import { parseEnum, parseFloatValue, parseColorRGB } from '../lib/data-parsers.js'

export const EffectFilmLookObjectEncodingDefinition: ObjectEncodingDefinition<EffectFilmLookObject> = {
	crack: { protocolName: 'crack', parser: parseFloatValue },
	spots: { protocolName: 'spots', parser: parseFloatValue },
	grain: { protocolName: 'grain', parser: parseFloatValue },
	shake: { protocolName: 'shake', parser: parseFloatValue },
	shadow: { protocolName: 'shadow', parser: parseFloatValue },
	colorMode: {
		protocolName: 'color mode',
		parser: (value) => parseEnum<EffectFilmLookColorMode>(value, EffectFilmLookColorMode),
	},
	colorStrength: { protocolName: 'color strength', parser: parseFloatValue },
}

export const EffectGlowEffectObjectEncodingDefinition: ObjectEncodingDefinition<EffectGlowEffectObject> = {
	clip: { protocolName: 'clip', parser: parseFloatValue },
	gain: { protocolName: 'gain', parser: parseFloatValue },
	softness: { protocolName: 'softness', parser: parseFloatValue },
	glowColor: { protocolName: 'glow color', parser: parseColorRGB },
}
