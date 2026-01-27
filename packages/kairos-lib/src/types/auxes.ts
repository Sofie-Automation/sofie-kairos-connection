import type { AnySourceRef } from '../lib/reference.js'
import type { OmitReadonly } from '../lib/omit-readonly.js'
import { ProcessingFormat } from './lib-types.js'

// NDI-AUX<1-2>
// STREAM-AUX<1-2>
// IP-AUX<1-32>
// SDI-AUX<1-16>
// HDMI-AUX<1-20> Added in 2.0
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

	/** Added in 2.0 */
	processingFormat: ProcessingFormat
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
