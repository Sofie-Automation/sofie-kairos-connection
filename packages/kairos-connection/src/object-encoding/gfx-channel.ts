import { parseRef } from '../lib/refs.js'
import type { ObjectEncodingDefinition } from './types.js'
import { GfxChannelObject, GfxSceneRef } from 'kairos-lib'

export const GfxChannelObjectEncodingDefinition: ObjectEncodingDefinition<GfxChannelObject> = {
	scene: { protocolName: 'scene', parser: (value) => parseRef<GfxSceneRef>('gfxScene', value) },
}
