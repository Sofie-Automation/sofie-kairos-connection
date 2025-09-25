import { OmitReadonly } from '../lib/omit-readonly.js'
import { MediaClipRef } from '../main.js'
import { ColorRGB } from './lib-types.js'

export interface ClipPlayerObject {
	colorOverwrite: boolean
	/**
	 * RGB color value
	 * @example rgb(255,0,0)
	 */
	color: ColorRGB
	timecode: string
	remainingTime: string
	/** int */
	position: number
	repeat: boolean
	tms: ClipPlayerTMS

	/** [ ObjectID ] */
	clip: MediaClipRef | null

	/** int */
	readonly tally: number

	autoplay: boolean
}

export enum ClipPlayerTMS {
	Pause = 'Pause',
	Reverse = 'Reverse',
	Rewind = 'Rewind',
	Play = 'Play',
	LoopPlay = 'LoopPlay',
	FastForward = 'FastForward',
	Stop = 'Stop',
	Begin = 'Begin',
	End = 'End',
}
export type UpdateClipPlayerObject = OmitReadonly<ClipPlayerObject>
