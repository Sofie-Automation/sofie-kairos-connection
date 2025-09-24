import { GfxSceneRef } from '../lib/reference.js'
import { OmitReadonly } from '../lib/omit-readonly.js'

export interface GfxChannelObject {
	/** [ ObjectID ] */
	scene: GfxSceneRef
}

export type UpdateGfxChannelObject = OmitReadonly<GfxChannelObject>
