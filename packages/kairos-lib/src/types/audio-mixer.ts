import { OmitReadonly } from '../lib/omit-readonly.js'

export interface AudioMixerObject {
	/**
	 * * [ float, min: -1, max: 0.2 ]
	 */
	volume: number

	/** [ bool ] */
	mute: boolean
}

export type UpdateAudioMixerObject = OmitReadonly<AudioMixerObject>
