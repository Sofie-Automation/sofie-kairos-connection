import type { ObjectEncodingDefinition } from './types.js'
import { parseBoolean, parseCommaSeparated, parseEnum, parseInteger, parseSourceRef } from '../lib/data-parsers.js'
import { AudioAuxObject, AuxObject, AuxRecordingStatus } from '../kairos-types/aux.js'

export const AuxObjectEncodingDefinition: ObjectEncodingDefinition<AuxObject> = {
	recordingStatus: {
		protocolName: 'recording_status',
		parser: (value) => parseEnum<AuxRecordingStatus>(value, AuxRecordingStatus),
	},
	name: {
		protocolName: 'name',
		parser: (value) => value,
	},
	available: {
		protocolName: 'available',
		parser: parseBoolean,
	},
	sourceOptions: {
		protocolName: 'sourceOptions',
		parser: (val) => parseCommaSeparated(val).map(parseSourceRef),
	},
	source: {
		protocolName: 'source',
		parser: parseSourceRef,
	},
	tallyRoot: {
		protocolName: 'tally_root',
		parser: parseInteger,
	},
}

export const AudioAuxObjectEncodingDefinition: ObjectEncodingDefinition<AudioAuxObject> = {
	name: {
		protocolName: 'name',
		parser: (value) => value,
	},
	available: {
		protocolName: 'available',
		parser: parseBoolean,
	},
	sourceOptions: {
		protocolName: 'sourceOptions',
		parser: (val) => parseCommaSeparated(val).map(parseSourceRef),
	},
	source: {
		protocolName: 'source',
		parser: parseSourceRef,
	},
}
