import { GfxSceneRef } from '../lib/reference.js'
import { OmitReadonly } from '../lib/omit-readonly.js'

export interface GfxChannelObject {
	/** [ ObjectID ] */
	scene: GfxSceneRef
}

export type UpdateGfxChannelObject = Omit<OmitReadonly<GfxChannelObject>, 'scene'> & {
	// Also allow string as input, for convenience:
	scene: GfxChannelObject['scene'] | string
}
