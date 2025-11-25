import { OmitReadonly } from '../lib/omit-readonly.js'
import { AnyMVSourceRef } from '../main.js'
import { ColorRGB, Pos2Df, Rotate } from './lib-types.js'

export interface MultiViewObject {
	/** bool */
	available: boolean

	/** ColorRGB */
	background: ColorRGB

	/** float */
	textScale: number

	/** enum */
	showTallyBorder: ShowTallyBorder

	/** float  [ min: 0.0 | max: 2.0 ]:  */
	tallyBorderWidth: number

	/** bool */
	// requestOnDemand: boolean // Got Error when trying to read this property
}

export interface MultiViewPipObject {
	/** Pos2Df */
	position: Pos2Df
	/** float */
	size: number
	/** enum */
	rotate: Rotate
	/** enum */
	labelPosition: LabelPosition
	/** ColorRGB */
	textColor: ColorRGB
	/** ColorRGB */
	backgroundColor: ColorRGB
	/** float */
	backgroundOpacity: number
}
export interface MultiViewInputObject {
	/** ObjectID **/
	source: AnyMVSourceRef
	/** int **/
	tallyRoot: number
	/** bool **/
	requestOnDemand: boolean
}

export enum ShowTallyBorder {
	'Never' = 'Never',
	'Active' = 'Active',
	'Always' = 'Always',
}

export enum LabelPosition {
	'Inside' = 'Inside',
	'Outside' = 'Outside',
	'Hidden' = 'Hidden',
}

// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateMultiViewObject = OmitReadonly<MultiViewObject>
export type UpdateMultiViewPipObject = OmitReadonly<MultiViewPipObject>
export type UpdateMultiViewInputObject = OmitReadonly<MultiViewInputObject>
