import type { AnySourceRef } from '../lib/reference.js'
import type { OmitReadonly } from '../lib/omit-readonly.js'

export interface AuxObject {
	readonly recordingStatus: AuxRecordingStatus

	name: string

	readonly available: boolean

	sourceOptions: AnySourceRef[]

	source: AnySourceRef

	/*
	 * [ integer ]
	 */
	tallyRoot: number
}

export interface AudioAuxObject {
	name: string

	readonly available: boolean

	sourceOptions: AnySourceRef[]

	source: AnySourceRef
}

// ------------------------- enums -----------------------------
export enum AuxRecordingStatus {
	Idle = 'idle',
	Recording = 'recording',
	RecorderUnavailable = 'recorder_unavailable',
	InvalidSourceIdentifier = 'invalid_source_identifier',
	InvalidCommand = 'invalid_command',
	OutOfMemory = 'out_of_memory',
	InvalidFormat = 'invalid_format',
	Timeout = 'timeout',
	InvalidMetaData = 'invalid_meta_data',
	GeneralError = 'general_error',
}
//

// ------------------------- types -----------------------------

// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateAuxObject = OmitReadonly<AuxObject>
export type UpdateAudioAuxObject = OmitReadonly<AudioAuxObject>
