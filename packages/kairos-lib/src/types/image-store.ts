import type { OmitReadonly } from '../lib/omit-readonly.js'
import { MediaImageRef, MediaStillRef } from '../main.js'
import type { ColorRGB, DissolveMode, Resolution } from './lib-types.js'

export interface ImageStoreObject {
	colorOverwrite: boolean
	/**
	 * RGB color value
	 * @example rgb(255,0,0)
	 */
	color: ColorRGB

	/** [ ObjectID ] */
	clip: MediaStillRef | MediaImageRef | null

	/** int */
	readonly tally: number

	dissolveEnabled: boolean
	/** int [ min: 0 | max: 9999 ] */
	dissolveTime: number
	dissolveMode: DissolveMode

	removeSourceAlpha: boolean

	scaleMode: ImageStoreScaleMode

	resolution: Resolution

	advancedResolutionControl: boolean

	/**
	 * [ integer, min: 16, max: 3840 ]
	 */
	resolutionX: number

	/**
	 * [ integer, min: 10, max: 2160 ]
	 */
	resolutionY: number
}

export enum ImageStoreScaleMode {
	Stretch = 'Stretch',
	KeepAspect = 'KeepAspect',
	KeepSize = 'KeepSize',
	Auto = 'Auto',
	None = 'None',
}

export type UpdateImageStoreObject = OmitReadonly<ImageStoreObject>
