import type { ObjectEncodingDefinition } from './types.js'
import { SceneTransitionObject, SceneTransitionMixEffectObject, SceneCurve } from '../kairos-types/scene.js'
import { parseEnum, parseInteger, parseFloatValue } from '../lib/data-parsers.js'

export const SceneTransitionObjectEncodingDefinition: ObjectEncodingDefinition<SceneTransitionObject> = {
	progress: { protocolName: 'progress', parser: parseFloatValue },
	progressFrames: { protocolName: 'progressFrames', parser: parseInteger }, // note: _not_ snake_case in docs!
	duration: { protocolName: 'duration', parser: parseInteger },
}

export const SceneTransitionMixEffectObjectEncodingDefinition: ObjectEncodingDefinition<SceneTransitionMixEffectObject> =
	{
		curve: {
			protocolName: 'curve',
			parser: (value) => parseEnum<SceneCurve>(value, SceneCurve),
		},
		effect: { protocolName: 'effect', parser: (value) => value },
		effectName: { protocolName: 'effect_name', parser: (value) => value },
	}
