import type { ObjectEncodingDefinition } from './types.js'
import { MediaObject } from 'kairos-lib'
import { parseInteger, parseFloatValue } from '../lib/data-parsers.js'

export const MediaObjectEncodingDefinition: ObjectEncodingDefinition<MediaObject> = {
	name: { protocolName: 'name', parser: (value) => value },
	status: { protocolName: 'status', parser: parseInteger },
	loadProgress: { protocolName: 'load_progress', parser: parseFloatValue },
}
