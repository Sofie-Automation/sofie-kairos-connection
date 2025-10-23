import type { ObjectEncodingDefinition } from './types.js'
import { MediaObject, MediaStatus, protocolDecodeStr } from 'kairos-lib'
import { parseFloatValue, parseEnum } from '../lib/data-parsers.js'

export const MediaObjectEncodingDefinition: ObjectEncodingDefinition<MediaObject> = {
	name: { protocolName: 'name', parser: (value) => protocolDecodeStr(value) },
	status: { protocolName: 'status', parser: (value) => parseEnum<MediaStatus>(value, MediaStatus) },
	loadProgress: { protocolName: 'load_progress', parser: parseFloatValue },
}
