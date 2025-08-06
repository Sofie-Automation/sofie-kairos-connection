import type { ObjectEncodingDefinition } from './types.js'
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
} from '../kairos-types/effects.js'
import { parseBoolean, parseEnum, parseInteger, parseFloatValue } from '../lib/data-parsers.js'

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

export const EffectTemperatureCorrectionObjectEncodingDefinition: ObjectEncodingDefinition<EffectTemperatureCorrectionObject> =
	{
		enabled: { protocolName: 'enabled', parser: parseBoolean },
		temperature: { protocolName: 'temperature', parser: parseInteger },
		tint: { protocolName: 'tint', parser: parseFloatValue },
		keepLuminance: { protocolName: 'keep_luminance', parser: parseBoolean },
	}
