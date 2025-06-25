import { OmitReadonly } from '../lib/omit-readonly.js'
import { ColorRGB } from './lib-types.js'

export interface MacroObject {
	readonly status: MacroStatus

	color: ColorRGB
}

// ------------------------- enums -----------------------------
export enum MacroStatus {
	Stopped = 'Stopped',
	Playing = 'Playing',
	Waiting = 'Waiting',
	Recording = 'Recording',
}

// ------------------------- types -----------------------------

// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateMacroObject = OmitReadonly<MacroObject>
