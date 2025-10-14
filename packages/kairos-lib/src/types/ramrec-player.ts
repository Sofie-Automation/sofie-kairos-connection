import { OmitReadonly } from '../lib/omit-readonly.js'
import { MediaRamRecRef } from '../main.js'
import { ClipPlayerObject } from './clip-player.js'

export type RamRecPlayerObject = Omit<ClipPlayerObject, 'clip'> & {
	clip: MediaRamRecRef | null
}

export type UpdateRamRecPlayerObject = Omit<OmitReadonly<RamRecPlayerObject>, 'clip'> & {
	// Also allow string as input, for convenience:
	clip: RamRecPlayerObject['clip'] | string
}
