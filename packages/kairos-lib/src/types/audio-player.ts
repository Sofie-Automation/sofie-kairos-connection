import { OmitReadonly } from '../lib/omit-readonly.js'
import { ClipPlayerObject } from './clip-player.js'

export type AudioPlayerObject = Omit<ClipPlayerObject, 'color' | 'colorOverwrite'>

export type UpdateAudioPlayerObject = OmitReadonly<AudioPlayerObject>
