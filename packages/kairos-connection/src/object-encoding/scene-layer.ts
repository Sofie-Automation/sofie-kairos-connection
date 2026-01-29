import type { ObjectEncodingDefinition } from './types.js'
import {
	SceneLayerActiveBus,
	SceneLayerBlendMode,
	SceneLayerMode,
	SceneLayerObject,
	SceneLayerPgmPstMode,
	SceneLayerState,
	DissolveMode,
} from 'kairos-lib'
import {
	parseBoolean,
	parseCommaSeparated,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parseColorRGB,
} from '../lib/data-parsers.js'
import { parseAnySourceRef } from '../lib/refs.js'

export const SceneLayerObjectEncodingDefinition: ObjectEncodingDefinition<SceneLayerObject> = {
	opacity: { protocolName: 'opacity', parser: parseFloatValue },
	sourceA: { protocolName: 'sourceA', parser: parseAnySourceRef },
	sourceB: { protocolName: 'sourceB', parser: parseAnySourceRef },
	sourcePgm: { protocolName: 'source_pgm', parser: parseAnySourceRef },
	sourcePst: { protocolName: 'source_pst', parser: parseAnySourceRef },
	activeBus: {
		protocolName: 'active_bus',
		parser: (value) => parseEnum<SceneLayerActiveBus>(value, SceneLayerActiveBus),
	},
	pgmPstMode: {
		protocolName: 'pgm_pst_mode',
		parser: (value) => parseEnum<SceneLayerPgmPstMode>(value, SceneLayerPgmPstMode),
	},
	sourceOptions: { protocolName: 'sourceOptions', parser: (val) => parseCommaSeparated(val).map(parseAnySourceRef) },
	state: { protocolName: 'state', parser: (value) => parseEnum<SceneLayerState>(value, SceneLayerState) },
	mode: { protocolName: 'mode', parser: (value) => parseEnum<SceneLayerMode>(value, SceneLayerMode) },
	fxEnabled: { protocolName: 'fxEnabled', parser: parseBoolean },
	presetEnabled: { protocolName: 'preset_enabled', parser: parseBoolean },
	color: { protocolName: 'color', parser: parseColorRGB },
	cleanMask: { protocolName: 'clean_mask', parser: parseInteger },
	sourceCleanMask: { protocolName: 'source_clean_mask', parser: parseInteger },
	dissolveEnabled: { protocolName: 'dissolve_enabled', parser: parseBoolean },
	dissolveTime: { protocolName: 'dissolve_time', parser: parseInteger },
	dissolveMode: {
		protocolName: 'dissolve_mode',
		parser: (value) => parseEnum<DissolveMode>(value, DissolveMode),
	},
	blendMode: {
		protocolName: 'blend_mode',
		parser: (value) => parseEnum<SceneLayerBlendMode>(value, SceneLayerBlendMode),
	},
}
