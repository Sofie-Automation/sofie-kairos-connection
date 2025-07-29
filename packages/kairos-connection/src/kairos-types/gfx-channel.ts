import { OmitReadonly } from '../lib/omit-readonly.js'

export interface GfxChannelObject {
	/** [ ObjectID ] */
	scene: string
}

export type UpdateGfxChannelObject = OmitReadonly<GfxChannelObject>
