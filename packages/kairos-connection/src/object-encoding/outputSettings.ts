import type { ObjectEncodingDefinition } from './types.js'
import {
	AudioOutputSettingObject,
	IpOutputSettingObject,
	NDIOutputSettingObject,
	SDIOutputSettingObject,
	StreamOutputSettingObject,
} from 'kairos-lib'
import { parseInteger, parseString } from '../lib/data-parsers.js'

export const IpOutputSettingEncodingDefinition: ObjectEncodingDefinition<IpOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const SDIOutputSettingEncodingDefinition: ObjectEncodingDefinition<SDIOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const NDIOutputSettingEncodingDefinition: ObjectEncodingDefinition<NDIOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const StreamOutputSettingEncodingDefinition: ObjectEncodingDefinition<StreamOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const AudioOutputSettingEncodingDefinition: ObjectEncodingDefinition<AudioOutputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
