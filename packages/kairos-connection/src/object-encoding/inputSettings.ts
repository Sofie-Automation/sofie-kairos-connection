import type { ObjectEncodingDefinition } from './types.js'
import {
	IpInputSettingObject,
	NDIInputSettingObject,
	SDIInputSettingObject,
	StreamInputSettingObject,
	HDMIInputSettingObject,
} from 'kairos-lib'
import { parseBoolean, parseInteger, parseString } from '../lib/data-parsers.js'

export const IpInputSettingEncodingDefinition: ObjectEncodingDefinition<IpInputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
	onDemand: { protocolName: 'on_demand', parser: parseBoolean },
	requested: { protocolName: 'requested', parser: parseBoolean },
}
export const SDIInputSettingEncodingDefinition: ObjectEncodingDefinition<SDIInputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const NDIInputSettingEncodingDefinition: ObjectEncodingDefinition<NDIInputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
}
export const StreamInputSettingEncodingDefinition: ObjectEncodingDefinition<StreamInputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const HDMIInputSettingEncodingDefinition: ObjectEncodingDefinition<HDMIInputSettingObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
}
