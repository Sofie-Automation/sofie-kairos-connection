import type { ObjectEncodingDefinition } from './types.js'
import {
	SceneLayerActiveBus,
	SceneLayerBlendMode,
	SceneLayerDissolveMode,
	SceneLayerMode,
	SceneLayerObject,
	SceneLayerPgmPstMode,
	SceneLayerState,
} from '../kairos-types/scene.js'
import {
	parseBoolean,
	parseCommaSeparated,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parseColorRGB,
} from '../lib/data-parsers.js'

export const SceneLayerObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerObject> = {
	opacity: { protocolName: 'opacity', parser: parseFloatValue },
	sourceA: { protocolName: 'sourceA', parser: (value) => value },
	sourceB: { protocolName: 'sourceB', parser: (value) => value },
	sourcePgm: { protocolName: 'source_pgm', parser: (value) => value },
	sourcePst: { protocolName: 'source_pst', parser: (value) => value },
	activeBus: {
		protocolName: 'active_bus',
		parser: (value) => parseEnum<SceneLayerActiveBus>(value, SceneLayerActiveBus),
	},
	pgmPstMode: {
		protocolName: 'pgm_pst_mode',
		parser: (value) => parseEnum<SceneLayerPgmPstMode>(value, SceneLayerPgmPstMode),
	},
	sourceOptions: { protocolName: 'sourceOptions', parser: parseCommaSeparated },
	state: { protocolName: 'state', parser: (value) => parseEnum<SceneLayerState>(value, SceneLayerState) },
	mode: { protocolName: 'mode', parser: (value) => parseEnum<SceneLayerMode>(value, SceneLayerMode) },
	fxEnabled: { protocolName: 'fxEnabled', parser: parseBoolean },
	presetEnabled: { protocolName: 'preset_enabled', parser: parseBoolean },
	color: { protocolName: 'color', parser: parseColorRGB },
	cleanMask: { protocolName: 'clean_mask', parser: parseInteger },
	sourceCleanMask: { protocolName: 'dissolve_enabled', parser: parseInteger },
	dissolveEnabled: { protocolName: 'dissolve_time', parser: parseBoolean },
	dissolveTime: { protocolName: 'source_clean_mask', parser: parseInteger },
	dissolveMode: {
		protocolName: 'dissolve_mode',
		parser: (value) => parseEnum<SceneLayerDissolveMode>(value, SceneLayerDissolveMode),
	},
	blendMode: {
		protocolName: 'blend_mode',
		parser: (value) => parseEnum<SceneLayerBlendMode>(value, SceneLayerBlendMode),
	},
}
