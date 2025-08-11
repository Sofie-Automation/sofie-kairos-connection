import type { AttributeUpdates, ObjectEncodingDefinition } from './types.js'
import {
	EffectFilmLookObject,
	EffectFilmLookColorMode,
	EffectGlowEffectObject,
	UpdateEffectFilmLookObject,
	UpdateEffectGlowEffectObject,
} from '../kairos-types/effects.js'
import {
	parseEnum,
	parseFloatValue,
	parseColorRGB,
	stringifyEnum,
	stringifyFloat,
	stringifyColorRGB,
} from '../lib/data-parsers.js'

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

export function EncodeUpdateEffectFilmLookObject(props: Partial<UpdateEffectFilmLookObject>): AttributeUpdates {
	return [
		{ attribute: 'crack', value: stringifyFloat(props.crack) },
		{ attribute: 'spots', value: stringifyFloat(props.spots) },
		{ attribute: 'grain', value: stringifyFloat(props.grain) },
		{ attribute: 'shake', value: stringifyFloat(props.shake) },
		{ attribute: 'shadow', value: stringifyFloat(props.shadow) },
		{
			attribute: 'color mode',
			value: stringifyEnum<EffectFilmLookColorMode>(props.colorMode, EffectFilmLookColorMode),
		},
		{ attribute: 'color strength', value: stringifyFloat(props.colorStrength) },
	]
}

export const EffectGlowEffectObjectEncodingDefinition: ObjectEncodingDefinition<EffectGlowEffectObject> = {
	clip: { protocolName: 'clip', parser: parseFloatValue },
	gain: { protocolName: 'gain', parser: parseFloatValue },
	softness: { protocolName: 'softness', parser: parseFloatValue },
	glowColor: { protocolName: 'glow color', parser: parseColorRGB },
}

export function EncodeUpdateEffectGlowEffectObject(props: Partial<UpdateEffectGlowEffectObject>): AttributeUpdates {
	return [
		// { attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'clip', value: stringifyFloat(props.clip) },
		{ attribute: 'gain', value: stringifyFloat(props.gain) },
		{ attribute: 'softness', value: stringifyFloat(props.softness) },
		{ attribute: 'glow color', value: stringifyColorRGB(props.glowColor) },
	]
}
