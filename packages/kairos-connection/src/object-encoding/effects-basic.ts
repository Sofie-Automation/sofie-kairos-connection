import type { AttributeUpdates, ObjectEncodingDefinition } from './types.js'
import {
	EffectCropObject,
	EffectTransform2DObject,
	EffectTransform2DType,
	EffectVirtualPTZObject,
	EffectPositionObject,
	EffectPositionRotate,
	EffectPCropObject,
	UpdateEffectCropObject,
	UpdateEffectPCropObject,
	UpdateEffectPositionObject,
	UpdateEffectTransform2DObject,
	UpdateEffectVirtualPTZObject,
} from 'kairos-lib'
import {
	parseBoolean,
	parseEnum,
	parseInteger,
	parseFloatValue,
	parsePos2D,
	parsePos2Df,
	parsePos3Df,
	stringifyFloat,
	stringifyBoolean,
	stringifyEnum,
	stringifyPos3Df,
	stringifyInteger,
	stringifyPos2D,
	stringifyPos2Df,
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

export function EncodeUpdateEffectCropObject(props: Partial<UpdateEffectCropObject>): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'top', value: stringifyFloat(props.top) },
		{ attribute: 'left', value: stringifyFloat(props.left) },
		{ attribute: 'right', value: stringifyFloat(props.right) },
		{ attribute: 'bottom', value: stringifyFloat(props.bottom) },
		{ attribute: 'softness', value: stringifyFloat(props.softness) },
		{ attribute: 'rounded_corners', value: stringifyFloat(props.roundedCorners) },
		{ attribute: 'global_softness', value: stringifyBoolean(props.globalSoftness) },
		// softness_top, softness_left, softness_right, softness_bottom are read-only
	]
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

export function EncodeUpdateEffectTransform2DObject(props: Partial<UpdateEffectTransform2DObject>): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{
			attribute: 'type',
			value: stringifyEnum<EffectTransform2DType>(props.type, EffectTransform2DType),
		},
		{ attribute: 'scale', value: stringifyFloat(props.scale) },
		{ attribute: 'rotation_x', value: stringifyFloat(props.rotationX) },
		{ attribute: 'rotation_y', value: stringifyFloat(props.rotationY) },
		{ attribute: 'rotation_z', value: stringifyFloat(props.rotationZ) },
		{ attribute: 'rotation_origin', value: stringifyPos3Df(props.rotationOrigin) },
		{ attribute: 'position', value: stringifyPos3Df(props.position) },
		{ attribute: 'cubic_interpolation', value: stringifyBoolean(props.cubicInterpolation) },
		{ attribute: 'hide_backside', value: stringifyBoolean(props.hideBackside) },
		{ attribute: 'stretch_h', value: stringifyFloat(props.stretchH) },
		{ attribute: 'stretch_v', value: stringifyFloat(props.stretchV) },
	]
}

export const EffectVirtualPTZObjectEncodingDefinition: ObjectEncodingDefinition<EffectVirtualPTZObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	position: { protocolName: 'position', parser: parsePos2Df },
	zoom: { protocolName: 'zoom', parser: parseFloatValue },
}

export function EncodeUpdateEffectVirtualPTZObject(props: Partial<UpdateEffectVirtualPTZObject>): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'position', value: stringifyPos2Df(props.position) },
		{ attribute: 'zoom', value: stringifyFloat(props.zoom) },
	]
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

export function EncodeUpdateEffectPositionObject(props: Partial<UpdateEffectPositionObject>): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'position', value: stringifyPos2D(props.position) },
		// { attribute: 'size', value: stringifyInteger(props.size) },
		{ attribute: 'width', value: stringifyInteger(props.width) },
		{ attribute: 'height', value: stringifyInteger(props.height) },
		{
			attribute: 'rotate',
			value: stringifyEnum<EffectPositionRotate>(props.rotate, EffectPositionRotate),
		},
	]
}

export const EffectPCropObjectEncodingDefinition: ObjectEncodingDefinition<EffectPCropObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	left: { protocolName: 'left', parser: parseInteger },
	right: { protocolName: 'right', parser: parseInteger },
	top: { protocolName: 'top', parser: parseInteger },
	bottom: { protocolName: 'bottom', parser: parseInteger },
}

export function EncodeUpdateEffectPCropObject(props: Partial<UpdateEffectPCropObject>): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'left', value: stringifyInteger(props.left) },
		{ attribute: 'right', value: stringifyInteger(props.right) },
		{ attribute: 'top', value: stringifyInteger(props.top) },
		{ attribute: 'bottom', value: stringifyInteger(props.bottom) },
	]
}
