import type { ObjectEncodingDefinition } from './types.js'
import { GfxChannelObject } from 'kairos-lib'
import { parseGfxSceneRef } from '../lib/data-parsers.js'

export const GfxChannelObjectEncodingDefinition: ObjectEncodingDefinition<GfxChannelObject> = {
	scene: { protocolName: 'scene', parser: (value) => parseGfxSceneRef(value) },
}
