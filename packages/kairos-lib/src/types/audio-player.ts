import { OmitReadonly } from '../lib/omit-readonly.js'
import { MediaSoundRef } from '../main.js'
import { ClipPlayerObject } from './clip-player.js'

export type AudioPlayerObject = Omit<ClipPlayerObject, 'color' | 'colorOverwrite' | 'clip'> & {
	clip: MediaSoundRef | null
}

export type UpdateAudioPlayerObject = OmitReadonly<AudioPlayerObject>
