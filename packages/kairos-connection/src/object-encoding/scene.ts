import type { ObjectEncodingDefinition } from './types.js'
import {
	SceneObject,
	SceneLimitOffAction,
	Resolution,
	SceneTransitionRef,
	SceneLayerEffectRef,
	ProcessingFormat,
} from 'kairos-lib'
import {
	parseBoolean,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parseColorRGB,
	parseCommaSeparated,
	parseRefOptional,
} from '../lib/data-parsers.js'
import { parseRef } from '../lib/refs.js'

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
	processingFormat: {
		protocolName: 'processing_format',
		parser: (value) => parseEnum<ProcessingFormat>(value, ProcessingFormat),
		addedInVersion: {
			v: '2.0',
			defaultValue: ProcessingFormat.Default,
		},
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
