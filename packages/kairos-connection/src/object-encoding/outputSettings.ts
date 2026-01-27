import type { ObjectEncodingDefinition } from './types.js'
import {
	AudioOutputSettingObject,
	BitDepth,
	ColorModel,
	FrequencyEnum,
	HDMIOutputSettingObject,
	IpOutputSettingObject,
	NDIOutputSettingObject,
	SDIOutputSettingObject,
	SDPColorspace,
	SDPTcs,
	StreamOutputSettingObject,
} from 'kairos-lib'
import { parseEnum, parseInteger, parseString } from '../lib/data-parsers.js'

export const IpOutputSettingEncodingDefinition: ObjectEncodingDefinition<IpOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },

	// Added in 2.0:
	format: { protocolName: 'format', parser: parseString, addedInVersion: { v: '2.0', defaultValue: '' } },
	frequency: {
		protocolName: 'frequency',
		parser: (value) => parseEnum<FrequencyEnum>(value, FrequencyEnum),
		addedInVersion: { v: '2.0', defaultValue: FrequencyEnum.NOT_SUPPORTED },
	},
	colorModel: {
		protocolName: 'color_model',
		parser: (value) => parseEnum<ColorModel>(value, ColorModel),
		addedInVersion: { v: '2.0', defaultValue: ColorModel.NOT_SUPPORTED },
	},
	bitDepth: {
		protocolName: 'bitdepth',
		parser: (value) => parseEnum<BitDepth>(value, BitDepth),
		addedInVersion: { v: '2.0', defaultValue: BitDepth.NOT_SUPPORTED },
	},
	SDPColorspace: {
		protocolName: 'SDP_Colorspace',
		parser: (value) => parseEnum<SDPColorspace>(value, SDPColorspace),
		addedInVersion: { v: '2.0', defaultValue: SDPColorspace.NOT_SUPPORTED },
	},
	SDPTcs: {
		protocolName: 'SDP_Tcs',
		parser: (value) => parseEnum<SDPTcs>(value, SDPTcs),
		addedInVersion: { v: '2.0', defaultValue: SDPTcs.NOT_SUPPORTED },
	},
	compare: { protocolName: 'compare', parser: parseString, addedInVersion: { v: '2.0', defaultValue: '<unknown>' } },
}
export const SDIOutputSettingEncodingDefinition: ObjectEncodingDefinition<SDIOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },

	// Added in 2.0:
	compare: { protocolName: 'compare', parser: parseString, addedInVersion: { v: '2.0', defaultValue: '<unknown>' } },
}
export const NDIOutputSettingEncodingDefinition: ObjectEncodingDefinition<NDIOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
	// Added in 2.0:
	compare: { protocolName: 'compare', parser: parseString, addedInVersion: { v: '2.0', defaultValue: '<unknown>' } },
}
export const StreamOutputSettingEncodingDefinition: ObjectEncodingDefinition<StreamOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
	// Added in 2.0:
	compare: { protocolName: 'compare', parser: parseString, addedInVersion: { v: '2.0', defaultValue: '<unknown>' } },
}
export const AudioOutputSettingEncodingDefinition: ObjectEncodingDefinition<AudioOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}

// Added in 2.0:
export const HDMIOutputSettingEncodingDefinition: ObjectEncodingDefinition<HDMIOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
	compare: { protocolName: 'compare', parser: parseString },
}
