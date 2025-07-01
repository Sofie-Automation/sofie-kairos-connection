import type { ObjectEncodingDefinition } from './types.js'
import {
	SceneLayerEffectFilmLookObject,
	SceneLayerEffectFilmLookColorMode,
	SceneLayerEffectGlowEffectObject,
} from '../kairos-types/scene.js'
import { parseEnum, parseFloatValue, parseColorRGB } from '../lib/data-parsers.js'

export const SceneLayerEffectFilmLookObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerEffectFilmLookObject> =
	{
		crack: { protocolName: 'crack', parser: parseFloatValue },
		spots: { protocolName: 'spots', parser: parseFloatValue },
		grain: { protocolName: 'grain', parser: parseFloatValue },
		shake: { protocolName: 'shake', parser: parseFloatValue },
		shadow: { protocolName: 'shadow', parser: parseFloatValue },
		colorMode: {
			protocolName: 'color mode',
			parser: (value) => parseEnum<SceneLayerEffectFilmLookColorMode>(value, SceneLayerEffectFilmLookColorMode),
		},
		colorStrength: { protocolName: 'color strength', parser: parseFloatValue },
	}

export const SceneLayerEffectGlowEffectObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerEffectGlowEffectObject> =
	{
		clip: { protocolName: 'clip', parser: parseFloatValue },
		gain: { protocolName: 'gain', parser: parseFloatValue },
		softness: { protocolName: 'softness', parser: parseFloatValue },
		glowColor: { protocolName: 'glow color', parser: parseColorRGB },
	}
