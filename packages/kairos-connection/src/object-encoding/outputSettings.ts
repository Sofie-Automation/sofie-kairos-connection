import type { ObjectEncodingDefinition } from './types.js'
import { AudioOutputObject, IpOutputObject, NDIOutputObject, SDIOutputObject, StreamOutputObject } from 'kairos-lib'
import { parseInteger, parseString } from '../lib/data-parsers.js'

export const IpOutputEncodingDefinition: ObjectEncodingDefinition<IpOutputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const SDIOutputEncodingDefinition: ObjectEncodingDefinition<SDIOutputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const NDIOutputEncodingDefinition: ObjectEncodingDefinition<NDIOutputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const StreamOutputEncodingDefinition: ObjectEncodingDefinition<StreamOutputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
export const AudioOutputEncodingDefinition: ObjectEncodingDefinition<AudioOutputObject> = {
	status: { protocolName: 'status', parser: parseInteger },
	statusText: { protocolName: 'status_text', parser: parseString },
	delay: { protocolName: 'delay', parser: parseInteger },
}
