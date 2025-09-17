import { OmitReadonly } from '../lib/omit-readonly.js'
import { ColorRGB, Resolution } from './lib-types.js'

export interface FxInputObject {
	name: string
	colorOverwrite: boolean
	readonly color: ColorRGB
	// backgroundEnable: boolean
	// backgroundColor: ColorRGB
	scaleMode: ScaleMode
	resolution: Resolution
	advancedResolutionControl: boolean
	/** [int, read_only, min: 16, max: 3840 ] */
	readonly resolutionX: number
	/** [int, read_only, min: 10, max: 2160 ] */
	readonly resolutionY: number
}
// ------------------------- enums -----------------------------
export enum ScaleMode {
	Stretch = 'Stretch',
	KeepAspect = 'KeepAspect',
	KeepSize = 'KeepSize',
	Auto = 'Auto',
	None = 'None',
}
// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateFxInputObject = OmitReadonly<FxInputObject>
