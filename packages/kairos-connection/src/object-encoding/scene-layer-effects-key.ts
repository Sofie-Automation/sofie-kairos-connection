import type { ObjectEncodingDefinition } from './types.js'
import {
	SceneLayerEffectLuminanceKeyObject,
	SceneLayerEffectLuminanceKeyBlendMode,
	SceneLayerEffectChromaKeyObject,
	SceneLayerEffectChromaKeyEdgeSmoothingSize,
	SceneLayerEffectLinearKeyObject,
	SceneLayerEffectLinearKeyBlendMode,
} from '../kairos-types/scene.js'
import { parseBoolean, parseEnum, parseFloatValue, parseInteger, parseSourceRefOptional } from '../lib/data-parsers.js'

export const SceneLayerEffectLuminanceKeyObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerEffectLuminanceKeyObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		clip: { protocolName: 'clip', parser: parseFloatValue },
		gain: { protocolName: 'gain', parser: parseFloatValue },
		cleanup: { protocolName: 'cleanup', parser: parseFloatValue },
		density: { protocolName: 'density', parser: parseFloatValue },
		invert: { protocolName: 'invert', parser: parseBoolean },
		blendMode: {
			protocolName: 'blend_mode',
			parser: (value) => parseEnum<SceneLayerEffectLuminanceKeyBlendMode>(value, SceneLayerEffectLuminanceKeyBlendMode),
		},
		sourceKey: { protocolName: 'sourceKey', parser: parseSourceRefOptional },
	}

export const SceneLayerEffectChromaKeyObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerEffectChromaKeyObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		clip: { protocolName: 'clip', parser: parseFloatValue },
		gain: { protocolName: 'gain', parser: parseFloatValue },
		cleanup: { protocolName: 'cleanup', parser: parseFloatValue },
		density: { protocolName: 'density', parser: parseFloatValue },
		hue: { protocolName: 'hue', parser: parseFloatValue },
		selectivityLeft: { protocolName: 'selectivity_left', parser: parseFloatValue },
		selectivityRight: { protocolName: 'selectivity_right', parser: parseFloatValue },
		luminance: { protocolName: 'luminance', parser: parseFloatValue },
		chroma: { protocolName: 'chroma', parser: parseFloatValue },
		aChroma: { protocolName: 'a_chroma', parser: parseFloatValue },
		spillSupression: { protocolName: 'spill_supression', parser: parseFloatValue },
		spillSupressionLeft: { protocolName: 'spill_supression_left', parser: parseFloatValue },
		spillSupressionRight: { protocolName: 'spill_supression_right', parser: parseFloatValue },
		noiseRemoval: { protocolName: 'noise_removal', parser: parseFloatValue },
		invert: { protocolName: 'invert', parser: parseBoolean },
		fgdFade: { protocolName: 'fgd_fade', parser: parseBoolean },
		autoState: { protocolName: 'auto_state', parser: parseInteger },
		edgeSmoothingSize: {
			protocolName: 'edge_smoothing_size',
			parser: (value) =>
				parseEnum<SceneLayerEffectChromaKeyEdgeSmoothingSize>(value, SceneLayerEffectChromaKeyEdgeSmoothingSize),
		},
	}

export const SceneLayerEffectLinearKeyObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerEffectLinearKeyObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		invert: { protocolName: 'invert', parser: parseBoolean },
		keySource: { protocolName: 'key_source', parser: parseSourceRefOptional },
		blendMode: {
			protocolName: 'blend_mode',
			parser: (value) => parseEnum<SceneLayerEffectLinearKeyBlendMode>(value, SceneLayerEffectLinearKeyBlendMode),
		},
	}
