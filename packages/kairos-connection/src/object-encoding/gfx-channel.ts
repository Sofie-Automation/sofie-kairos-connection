import type { ObjectEncodingDefinition } from './types.js'
import { GfxChannelObject } from '../kairos-types/gfx-channel.js'

export const GfxChannelObjectEncodingDefinition: ObjectEncodingDefinition<GfxChannelObject> = {
	scene: { protocolName: 'scene', parser: (value) => value },
}
