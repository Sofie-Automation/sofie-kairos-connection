import type { ObjectEncodingDefinition } from './types.js'
import { SceneObject, SceneLimitOffAction, Resolution, SceneTransitionRef, SceneLayerEffectRef } from 'kairos-lib'
import {
	parseBoolean,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parseColorRGB,
	parseCommaSeparated,
	parseRef,
	parseRefOptional,
} from '../lib/data-parsers.js'

export const SceneObjectEncodingDefinition: ObjectEncodingDefinition<SceneObject> = {
	advancedResolutionControl: { protocolName: 'advanced_resolution_control', parser: parseBoolean },
	resolutionX: { protocolName: 'resolution_x', parser: parseInteger },
	resolutionY: { protocolName: 'resolution_y', parser: parseInteger },
	tally: { protocolName: 'tally', parser: parseInteger },
	color: { protocolName: 'color', parser: parseColorRGB },
	resolution: {
		protocolName: 'resolution',
		parser: (value) => parseEnum<Resolution>(value, Resolution),
	},
	nextTransition: {
		protocolName: 'next_transition',
		parser: (value) => parseCommaSeparated(value).map((o) => parseRef<SceneTransitionRef>('scene-transition', o)),
	},
	allDuration: { protocolName: 'all_duration', parser: parseInteger },
	allFader: { protocolName: 'all_fader', parser: parseFloatValue },
	// nextTransitionType: { protocolName: 'next_transition_type', parser: (value) => value }, // We don't know what this is, so we leave it out
	faderReverse: { protocolName: 'fader_reverse', parser: parseBoolean },
	faderSync: { protocolName: 'fader_sync', parser: parseBoolean },
	limitOffAction: {
		protocolName: 'limit_off_action',
		parser: (value) => parseEnum<SceneLimitOffAction>(value, SceneLimitOffAction),
	},
	limitReturnTime: { protocolName: 'limit_return_time', parser: parseInteger },
	keyPreview: {
		protocolName: 'key_preview',
		parser: (value) => parseRefOptional<SceneLayerEffectRef>('scene-layer-effect', value),
	},
}
