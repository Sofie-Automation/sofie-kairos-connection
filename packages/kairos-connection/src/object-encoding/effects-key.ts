import type { ObjectEncodingDefinition } from './types.js'
import {
	EffectLuminanceKeyObject,
	EffectLuminanceKeyBlendMode,
	EffectChromaKeyObject,
	EffectChromaKeyEdgeSmoothingSize,
	EffectLinearKeyObject,
	EffectLinearKeyBlendMode,
} from 'kairos-lib'
import {
	parseBoolean,
	parseEnum,
	parseFloatValue,
	parseInteger,
	parseAnySourceRefOptional,
} from '../lib/data-parsers.js'

export const EffectLuminanceKeyObjectEncodingDefinition: ObjectEncodingDefinition<EffectLuminanceKeyObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	clip: { protocolName: 'clip', parser: parseFloatValue },
	gain: { protocolName: 'gain', parser: parseFloatValue },
	cleanup: { protocolName: 'cleanup', parser: parseFloatValue },
	density: { protocolName: 'density', parser: parseFloatValue },
	invert: { protocolName: 'invert', parser: parseBoolean },
	blendMode: {
		protocolName: 'blend_mode',
		parser: (value) => parseEnum<EffectLuminanceKeyBlendMode>(value, EffectLuminanceKeyBlendMode),
	},
	sourceKey: { protocolName: 'sourceKey', parser: parseAnySourceRefOptional },
}

export const EffectChromaKeyObjectEncodingDefinition: ObjectEncodingDefinition<EffectChromaKeyObject> = {
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
		parser: (value) => parseEnum<EffectChromaKeyEdgeSmoothingSize>(value, EffectChromaKeyEdgeSmoothingSize),
	},
}

export const EffectLinearKeyObjectEncodingDefinition: ObjectEncodingDefinition<EffectLinearKeyObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	invert: { protocolName: 'invert', parser: parseBoolean },
	keySource: { protocolName: 'key_source', parser: parseAnySourceRefOptional },
	blendMode: {
		protocolName: 'blend_mode',
		parser: (value) => parseEnum<EffectLinearKeyBlendMode>(value, EffectLinearKeyBlendMode),
	},
}
