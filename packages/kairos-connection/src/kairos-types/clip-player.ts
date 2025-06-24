import { OmitReadonly } from '../lib/omit-readonly.js'

export interface ClipPlayerObject {
	colorOverwrite: boolean
	/**
	 * RGB color value
	 * @example rgb(255,0,0)
	 */
	color: string
	timecode: string
	remainingTime: string
	/** int */
	position: number
	repeat: boolean
	tms: ClipPlayerTMS

	/** [ ObjectID ] */
	clip: string

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
