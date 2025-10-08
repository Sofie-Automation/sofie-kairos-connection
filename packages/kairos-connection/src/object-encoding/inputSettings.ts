import type { ObjectEncodingDefinition } from './types.js'
import { IpInputObject, NDIInputObject, SDIInputObject, StreamInputObject } from 'kairos-lib'
import { parseBoolean, parseInteger, parseString } from '../lib/data-parsers.js'

export const IpInputEncodingDefinition: ObjectEncodingDefinition<IpInputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
	onDemand: { protocolName: 'on_demand', parser: parseBoolean },
	requested: { protocolName: 'requested', parser: parseBoolean },
}
export const SDIInputEncodingDefinition: ObjectEncodingDefinition<SDIInputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const NDIInputEncodingDefinition: ObjectEncodingDefinition<NDIInputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
}
export const StreamInputEncodingDefinition: ObjectEncodingDefinition<StreamInputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	tally: { protocolName: 'tally', parser: parseInteger },
	delay: { protocolName: 'delay', parser: parseInteger },
}
