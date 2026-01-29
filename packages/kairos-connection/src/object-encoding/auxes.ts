import type { ObjectEncodingDefinition } from './types.js'
import { parseBoolean, parseCommaSeparated, parseEnum, parseInteger } from '../lib/data-parsers.js'
import { AudioAuxObject, AuxObject, AuxRecordingStatus, ProcessingFormat } from 'kairos-lib'
import { parseAnySourceRef } from '../lib/refs.js'

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
		parser: (val) => parseCommaSeparated(val).map(parseAnySourceRef),
	},
	source: {
		protocolName: 'source',
		parser: parseAnySourceRef,
	},
	tallyRoot: {
		protocolName: 'tally_root',
		parser: parseInteger,
	},
	processingFormat: {
		protocolName: 'processing_format',
		parser: (value) => parseEnum<ProcessingFormat>(value, ProcessingFormat),
		addedInVersion: { v: '2.0', defaultValue: ProcessingFormat.Default },
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
		parser: (val) => parseCommaSeparated(val).map(parseAnySourceRef),
	},
	source: {
		protocolName: 'source',
		parser: parseAnySourceRef,
	},
}
