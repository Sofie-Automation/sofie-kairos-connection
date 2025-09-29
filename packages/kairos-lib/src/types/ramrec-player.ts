import { OmitReadonly } from '../lib/omit-readonly.js'
import { MediaRamRecRef } from '../main.js'
import { ClipPlayerObject } from './clip-player.js'

export type RamRecPlayerObject = Omit<ClipPlayerObject, 'clip'> & {
	clip: MediaRamRecRef | null
}

export type UpdateRamRecPlayerObject = OmitReadonly<RamRecPlayerObject>
