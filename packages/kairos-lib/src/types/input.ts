import type { OmitReadonly } from '../lib/omit-readonly.js'
import { AnyInputRef } from '../lib/reference.js'
import type { ColorRGB } from './lib-types.js'

export interface InputObject {
	type: AnyInputRef['realm']

	name: string

	/**
	 * Tally is monitoring if the selected Scene fulfills a certain predefined Tally condition,
	 * like for example: - Red for OnAir Tally - Yellow for Preview Tally - Green for Monitor
	 * Tally - Blue for Audience Tally - Magenta for Audio Source Tally - etc.
	 * In order to specify certain Tally conditions, select the “Aux” menu from the “Config”
	 * tray and configure the individual Aux outputs 1-16 to the desired Tally
	 * color/functionality. “Red” is default for “On Air” Tally and “Yellow” is default for
	 * Preview (PVW) Tally.
	 *
	 * [ integer ]
	 */
	readonly tally: number

	readonly available: boolean

	readonly recordingStatus: InputRecordingStatus

	colorOverwrite: boolean

	/**
	 * The “Color” setting allows the User to define a specific Scene color which is
	 * automatically applied to be used for the background color of the selected Scene.
	 * When clicking the area right next to the “Color” setting, a pop-up window allows to
	 * pick a color from the palette,“Pick Screen Color” or enter a HTML color code, RGB
	 * or HSL-values into the designated field. Also “Custom colors” can be saved within
	 * the pop-up dialog.
	 * @example rgb(255,0,0)
	 */
	color: ColorRGB
}

// ------------------------- enums -----------------------------
export enum InputRecordingStatus {
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
export type UpdateInputObject = OmitReadonly<InputObject>
