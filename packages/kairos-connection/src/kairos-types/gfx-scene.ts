import { OmitReadonly } from '../lib/omit-readonly.js'
import { Pos2Df, SceneResolution } from './main.js'

export interface GfxSceneObject {
	resolution: SceneResolution
}
export type UpdateGfxSceneObject = OmitReadonly<GfxSceneObject>

export interface GfxSceneItemObject {
	position: Pos2Df

	/**
	 * [ int, min: 1, max: 4096 ]
	 */
	width: number

	// size: number // wierd, we get an Error if we query for the size

	/**
	 * [ int, min: 1, max: 4096 ]
	 */
	height: number
}
export type UpdateGfxSceneItemObject = OmitReadonly<GfxSceneItemObject>

export interface GfxSceneHTMLElementItemObject extends GfxSceneItemObject {
	url: string
}
export type UpdateGfxSceneHTMLElementItemObject = OmitReadonly<GfxSceneHTMLElementItemObject>

export interface GfxSceneTextItemObject extends GfxSceneItemObject {
	text: string

	text_options: string[]
}
export type UpdateGfxSceneTextItemObject = OmitReadonly<GfxSceneTextItemObject>

export interface GfxSceneCounterItemObject extends GfxSceneItemObject {
	/**
	 * [ int, min: -9999, max: 9999 ]
	 */
	value: number
}
export type UpdateGfxSceneCounterItemObject = OmitReadonly<GfxSceneCounterItemObject>

export interface GfxSceneClockItemObject extends GfxSceneItemObject {
	/**
	 * [ int, min: -9999, max: 9999 ]
	 */
	start: number
}
export type UpdateGfxSceneClockItemObject = OmitReadonly<GfxSceneClockItemObject>
