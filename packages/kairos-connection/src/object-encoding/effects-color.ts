import type { AttributeUpdates, ObjectEncodingDefinition } from './types.js'
import {
	EffectYUVCorrectionObject,
	EffectRGBCorrectionObject,
	EffectLUTCorrectionObject,
	EffectLUTCorrectionIndex,
	EffectLUTCorrectionColorspace,
	EffectLUTCorrectionRange,
	EffectToneCurveCorrectionObject,
	EffectMatrixCorrectionObject,
	EffectTemperatureCorrectionObject,
	UpdateEffectTemperatureCorrectionObject,
	UpdateEffectLUTCorrectionObject,
	UpdateEffectMatrixCorrectionObject,
	UpdateEffectRGBCorrectionObject,
	UpdateEffectToneCurveCorrectionObject,
	UpdateEffectYUVCorrectionObject,
} from '../kairos-types/effects.js'
import {
	parseBoolean,
	parseEnum,
	parseInteger,
	parseFloatValue,
	stringifyBoolean,
	stringifyInteger,
	stringifyEnum,
	stringifyFloat,
} from '../lib/data-parsers.js'

export const EffectYUVCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectYUVCorrectionObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	pedestal: { protocolName: 'pedestal', parser: parseFloatValue },
	luminanceLift: { protocolName: 'luminance_lift', parser: parseFloatValue },
	luminanceGain: { protocolName: 'luminance_gain', parser: parseFloatValue },
	luminanceGamma: { protocolName: 'luminance_gamma', parser: parseFloatValue },
	contrast: { protocolName: 'contrast', parser: parseFloatValue },
	saturation: { protocolName: 'saturation', parser: parseFloatValue },
	uvRotation: { protocolName: 'UV_rotation', parser: parseFloatValue },
	cyanRed: { protocolName: 'cyan_red', parser: parseFloatValue },
	magentaGreen: { protocolName: 'magenta_green', parser: parseFloatValue },
	yellowBlue: { protocolName: 'yellow_blue', parser: parseFloatValue },
}

export function EncodeUpdateEffectYUVCorrectionObject(
	props: Partial<UpdateEffectYUVCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'pedestal', value: stringifyFloat(props.pedestal) },
		{ attribute: 'luminance_lift', value: stringifyFloat(props.luminanceLift) },
		{ attribute: 'luminance_gain', value: stringifyFloat(props.luminanceGain) },
		{ attribute: 'luminance_gamma', value: stringifyFloat(props.luminanceGamma) },
		{ attribute: 'contrast', value: stringifyFloat(props.contrast) },
		{ attribute: 'saturation', value: stringifyFloat(props.saturation) },
		{ attribute: 'UV_rotation', value: stringifyFloat(props.uvRotation) },
		{ attribute: 'cyan_red', value: stringifyFloat(props.cyanRed) },
		{ attribute: 'magenta_green', value: stringifyFloat(props.magentaGreen) },
		{ attribute: 'yellow_blue', value: stringifyFloat(props.yellowBlue) },
	]
}

export const EffectRGBCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectRGBCorrectionObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	pedestalRed: { protocolName: 'pedestal_red', parser: parseFloatValue },
	pedestalGreen: { protocolName: 'pedestal_green', parser: parseFloatValue },
	pedestalBlue: { protocolName: 'pedestal_blue', parser: parseFloatValue },
	liftRed: { protocolName: 'lift_red', parser: parseFloatValue },
	liftGreen: { protocolName: 'lift_green', parser: parseFloatValue },
	liftBlue: { protocolName: 'lift_blue', parser: parseFloatValue },
	gainRed: { protocolName: 'gain_red', parser: parseFloatValue },
	gainGreen: { protocolName: 'gain_green', parser: parseFloatValue },
	gainBlue: { protocolName: 'gain_blue', parser: parseFloatValue },
	gammaRed: { protocolName: 'gamma_red', parser: parseFloatValue },
	gammaGreen: { protocolName: 'gamma_green', parser: parseFloatValue },
	gammaBlue: { protocolName: 'gamma_blue', parser: parseFloatValue },
}

export function EncodeUpdateEffectRGBCorrectionObject(
	props: Partial<UpdateEffectRGBCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'pedestal_red', value: stringifyFloat(props.pedestalRed) },
		{ attribute: 'pedestal_green', value: stringifyFloat(props.pedestalGreen) },
		{ attribute: 'pedestal_blue', value: stringifyFloat(props.pedestalBlue) },
		{ attribute: 'lift_red', value: stringifyFloat(props.liftRed) },
		{ attribute: 'lift_green', value: stringifyFloat(props.liftGreen) },
		{ attribute: 'lift_blue', value: stringifyFloat(props.liftBlue) },
		{ attribute: 'gain_red', value: stringifyFloat(props.gainRed) },
		{ attribute: 'gain_green', value: stringifyFloat(props.gainGreen) },
		{ attribute: 'gain_blue', value: stringifyFloat(props.gainBlue) },
		{ attribute: 'gamma_red', value: stringifyFloat(props.gammaRed) },
		{ attribute: 'gamma_green', value: stringifyFloat(props.gammaGreen) },
		{ attribute: 'gamma_blue', value: stringifyFloat(props.gammaBlue) },
	]
}

export const EffectLUTCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectLUTCorrectionObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	index: {
		protocolName: 'index',
		parser: (value) => parseEnum<EffectLUTCorrectionIndex>(value, EffectLUTCorrectionIndex),
	},
	inputColorspace: {
		protocolName: 'input_colorspace',
		parser: (value) => parseEnum<EffectLUTCorrectionColorspace>(value, EffectLUTCorrectionColorspace),
	},
	outputColorspace: {
		protocolName: 'output_colorspace',
		parser: (value) => parseEnum<EffectLUTCorrectionColorspace>(value, EffectLUTCorrectionColorspace),
	},
	inputRange: {
		protocolName: 'input_range',
		parser: (value) => parseEnum<EffectLUTCorrectionRange>(value, EffectLUTCorrectionRange),
	},
	outputRange: {
		protocolName: 'output_range',
		parser: (value) => parseEnum<EffectLUTCorrectionRange>(value, EffectLUTCorrectionRange),
	},
	colorSpaceConversion: { protocolName: 'color_space_conversion', parser: parseBoolean },
}

export function EncodeUpdateEffectLUTCorrectionObject(
	props: Partial<UpdateEffectLUTCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{
			attribute: 'index',
			value: stringifyEnum<EffectLUTCorrectionIndex>(props.index, EffectLUTCorrectionIndex),
		},
		{
			attribute: 'input_colorspace',
			value: stringifyEnum<EffectLUTCorrectionColorspace>(props.inputColorspace, EffectLUTCorrectionColorspace),
		},
		{
			attribute: 'output_colorspace',
			value: stringifyEnum<EffectLUTCorrectionColorspace>(props.outputColorspace, EffectLUTCorrectionColorspace),
		},
		{
			attribute: 'input_range',
			value: stringifyEnum<EffectLUTCorrectionRange>(props.inputRange, EffectLUTCorrectionRange),
		},
		{
			attribute: 'output_range',
			value: stringifyEnum<EffectLUTCorrectionRange>(props.outputRange, EffectLUTCorrectionRange),
		},
		{ attribute: 'color_space_conversion', value: stringifyBoolean(props.colorSpaceConversion) },
	]
}

export const EffectToneCurveCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectToneCurveCorrectionObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		blackRed: { protocolName: 'black_red', parser: parseFloatValue },
		blackGreen: { protocolName: 'black_green', parser: parseFloatValue },
		blackBlue: { protocolName: 'black_blue', parser: parseFloatValue },
		grayLowRed: { protocolName: 'gray_low_red', parser: parseFloatValue },
		grayLowGreen: { protocolName: 'gray_low_green', parser: parseFloatValue },
		grayLowBlue: { protocolName: 'gray_low_blue', parser: parseFloatValue },
		grayHighRed: { protocolName: 'gray_high_red', parser: parseFloatValue },
		grayHighGreen: { protocolName: 'gray_high_green', parser: parseFloatValue },
		grayHighBlue: { protocolName: 'gray_high_blue', parser: parseFloatValue },
		whiteRed: { protocolName: 'white_red', parser: parseFloatValue },
		whiteGreen: { protocolName: 'white_green', parser: parseFloatValue },
		whiteBlue: { protocolName: 'white_blue', parser: parseFloatValue },
	}

export function EncodeUpdateEffectToneCurveCorrectionObject(
	props: Partial<UpdateEffectToneCurveCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'black_red', value: stringifyFloat(props.blackRed) },
		{ attribute: 'black_green', value: stringifyFloat(props.blackGreen) },
		{ attribute: 'black_blue', value: stringifyFloat(props.blackBlue) },
		{ attribute: 'gray_low_red', value: stringifyFloat(props.grayLowRed) },
		{ attribute: 'gray_low_green', value: stringifyFloat(props.grayLowGreen) },
		{ attribute: 'gray_low_blue', value: stringifyFloat(props.grayLowBlue) },
		{ attribute: 'gray_high_red', value: stringifyFloat(props.grayHighRed) },
		{ attribute: 'gray_high_green', value: stringifyFloat(props.grayHighGreen) },
		{ attribute: 'gray_high_blue', value: stringifyFloat(props.grayHighBlue) },
		{ attribute: 'white_red', value: stringifyFloat(props.whiteRed) },
		{ attribute: 'white_green', value: stringifyFloat(props.whiteGreen) },
		{ attribute: 'white_blue', value: stringifyFloat(props.whiteBlue) },
	]
}

export const EffectMatrixCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectMatrixCorrectionObject> = {
	enabled: { protocolName: 'enabled', parser: parseBoolean },
	rgN: { protocolName: 'r-g_n', parser: parseFloatValue },
	rgP: { protocolName: 'r-g_p', parser: parseFloatValue },
	rbN: { protocolName: 'r-b_n', parser: parseFloatValue },
	rbP: { protocolName: 'r-b_p', parser: parseFloatValue },
	grN: { protocolName: 'g-r_n', parser: parseFloatValue },
	grP: { protocolName: 'g-r_p', parser: parseFloatValue },
	gbN: { protocolName: 'g-b_n', parser: parseFloatValue },
	gbP: { protocolName: 'g-b_p', parser: parseFloatValue },
	brN: { protocolName: 'b-r_n', parser: parseFloatValue },
	brP: { protocolName: 'b-r_p', parser: parseFloatValue },
	bgN: { protocolName: 'b-g_n', parser: parseFloatValue },
	bgP: { protocolName: 'b-g_p', parser: parseFloatValue },
	redPhase: { protocolName: 'red_phase', parser: parseFloatValue },
	redLevel: { protocolName: 'red_level', parser: parseFloatValue },
	yellowPhase: { protocolName: 'yellow_phase', parser: parseFloatValue },
	yellowLevel: { protocolName: 'yellow_level', parser: parseFloatValue },
	greenPhase: { protocolName: 'green_phase', parser: parseFloatValue },
	greenLevel: { protocolName: 'green_level', parser: parseFloatValue },
	cyanPhase: { protocolName: 'cyan_phase', parser: parseFloatValue },
	cyanLevel: { protocolName: 'cyan_level', parser: parseFloatValue },
	bluePhase: { protocolName: 'blue_phase', parser: parseFloatValue },
	blueLevel: { protocolName: 'blue_level', parser: parseFloatValue },
	magentaPhase: { protocolName: 'magenta_phase', parser: parseFloatValue },
	magentaLevel: { protocolName: 'magenta_level', parser: parseFloatValue },
}

export function EncodeUpdateEffectMatrixCorrectionObject(
	props: Partial<UpdateEffectMatrixCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'r-g_n', value: stringifyFloat(props.rgN) },
		{ attribute: 'r-g_p', value: stringifyFloat(props.rgP) },
		{ attribute: 'r-b_n', value: stringifyFloat(props.rbN) },
		{ attribute: 'r-b_p', value: stringifyFloat(props.rbP) },
		{ attribute: 'g-r_n', value: stringifyFloat(props.grN) },
		{ attribute: 'g-r_p', value: stringifyFloat(props.grP) },
		{ attribute: 'g-b_n', value: stringifyFloat(props.gbN) },
		{ attribute: 'g-b_p', value: stringifyFloat(props.gbP) },
		{ attribute: 'b-r_n', value: stringifyFloat(props.brN) },
		{ attribute: 'b-r_p', value: stringifyFloat(props.brP) },
		{ attribute: 'b-g_n', value: stringifyFloat(props.bgN) },
		{ attribute: 'b-g_p', value: stringifyFloat(props.bgP) },
		{ attribute: 'red_phase', value: stringifyFloat(props.redPhase) },
		{ attribute: 'red_level', value: stringifyFloat(props.redLevel) },
		{ attribute: 'yellow_phase', value: stringifyFloat(props.yellowPhase) },
		{ attribute: 'yellow_level', value: stringifyFloat(props.yellowLevel) },
		{ attribute: 'green_phase', value: stringifyFloat(props.greenPhase) },
		{ attribute: 'green_level', value: stringifyFloat(props.greenLevel) },
		{ attribute: 'cyan_phase', value: stringifyFloat(props.cyanPhase) },
		{ attribute: 'cyan_level', value: stringifyFloat(props.cyanLevel) },
		{ attribute: 'blue_phase', value: stringifyFloat(props.bluePhase) },
		{ attribute: 'blue_level', value: stringifyFloat(props.blueLevel) },
		{ attribute: 'magenta_phase', value: stringifyFloat(props.magentaPhase) },
		{ attribute: 'magenta_level', value: stringifyFloat(props.magentaLevel) },
	]
}

export const EffectTemperatureCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectTemperatureCorrectionObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		temperature: { protocolName: 'temperature', parser: parseInteger },
		tint: { protocolName: 'tint', parser: parseFloatValue },
		keepLuminance: { protocolName: 'keep_luminance', parser: parseBoolean },
	}

export function EncodeUpdateEffectTemperatureCorrectionObject(
	props: Partial<UpdateEffectTemperatureCorrectionObject>
): AttributeUpdates {
	return [
		{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
		{ attribute: 'temperature', value: stringifyInteger(props.temperature) },
		{ attribute: 'tint', value: stringifyFloat(props.tint) },
		{ attribute: 'keep_luminance', value: stringifyBoolean(props.keepLuminance) },
	]
}
