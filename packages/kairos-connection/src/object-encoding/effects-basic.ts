import type { ObjectEncodingDefinition } from './types.js'
import {
	EffectCropObject,
	EffectTransform2DObject,
	EffectTransform2DType,
	EffectVirtualPTZObject,
	EffectPositionObject,
	EffectPositionRotate,
	EffectPCropObject,
} from '../kairos-types/effects.js'
import {
	parseBoolean,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parsePos2D,
	parsePos2Df,
	parsePos3Df,
} from '../lib/data-parsers.js'

export const EffectCropObjectEncodingDefinition: ObjectEncodingDefinition<EffectCropObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	top: { protocolName: 'top', parser: parseFloatValue },
	left: { protocolName: 'left', parser: parseFloatValue },
	right: { protocolName: 'right', parser: parseFloatValue },
	bottom: { protocolName: 'bottom', parser: parseFloatValue },
	softness: { protocolName: 'softness', parser: parseFloatValue },
	roundedCorners: { protocolName: 'rounded_corners', parser: parseFloatValue },
	globalSoftness: { protocolName: 'global_softness', parser: parseBoolean },
	softnessTop: { protocolName: 'softness_top', parser: parseFloatValue },
	softnessLeft: { protocolName: 'softness_left', parser: parseFloatValue },
	softnessRight: { protocolName: 'softness_right', parser: parseFloatValue },
	softnessBottom: { protocolName: 'softness_bottom', parser: parseFloatValue },
}

export const EffectTransform2DObjectEncodingDefinition: ObjectEncodingDefinition<EffectTransform2DObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	type: {
		protocolName: 'type',
		parser: (value) => parseEnum<EffectTransform2DType>(value, EffectTransform2DType),
	},
	scale: { protocolName: 'scale', parser: parseFloatValue },
	rotationX: { protocolName: 'rotation_x', parser: parseFloatValue },
	rotationY: { protocolName: 'rotation_y', parser: parseFloatValue },
	rotationZ: { protocolName: 'rotation_z', parser: parseFloatValue },
	rotationOrigin: { protocolName: 'rotation_origin', parser: parsePos3Df },
	position: { protocolName: 'position', parser: parsePos3Df },
	cubicInterpolation: { protocolName: 'cubic_interpolation', parser: parseBoolean },
	hideBackside: { protocolName: 'hide_backside', parser: parseBoolean },
	stretchH: { protocolName: 'stretch_h', parser: parseFloatValue },
	stretchV: { protocolName: 'stretch_v', parser: parseFloatValue },
}

export const EffectVirtualPTZObjectEncodingDefinition: ObjectEncodingDefinition<EffectVirtualPTZObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	position: { protocolName: 'position', parser: parsePos2Df },
	zoom: { protocolName: 'zoom', parser: parseFloatValue },
}

export const EffectPositionObjectEncodingDefinition: ObjectEncodingDefinition<EffectPositionObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	position: { protocolName: 'position', parser: parsePos2D },
	width: { protocolName: 'width', parser: parseInteger },
	height: { protocolName: 'height', parser: parseInteger },
	rotate: {
		protocolName: 'rotate',
		parser: (value) => parseEnum<EffectPositionRotate>(value, EffectPositionRotate),
	},
}

export const EffectPCropObjectEncodingDefinition: ObjectEncodingDefinition<EffectPCropObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	left: { protocolName: 'left', parser: parseInteger },
	right: { protocolName: 'right', parser: parseInteger },
	top: { protocolName: 'top', parser: parseInteger },
	bottom: { protocolName: 'bottom', parser: parseInteger },
}
