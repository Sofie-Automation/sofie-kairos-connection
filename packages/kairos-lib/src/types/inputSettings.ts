import { OmitReadonly } from '../lib/omit-readonly.js'

export interface IpInputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : tally [ read_only ] **/
	readonly tally: number
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
	/** bool : on_demand **/
	onDemand: boolean
	/** bool : requested [ read_only ] **/
	readonly requested: boolean
}
export interface SDIInputSettingObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
	/** int : delay [ min: 0 | max: 12 ] */
	delay: number
}
export interface NDIInputSettingObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
}
export interface StreamInputSettingObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
	/** int : delay [ min: 0 | max: 30 ] */
	delay: number
}
export interface HDMIInputSettingObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
	/** int : delay [ min: 0 | max: 30 ] */
	delay: number
}

// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateIpInputSettingObject = OmitReadonly<IpInputSettingObject>
export type UpdateSDIInputSettingObject = OmitReadonly<SDIInputSettingObject>
export type UpdateNDIInputSettingObject = OmitReadonly<NDIInputSettingObject>
export type UpdateStreamInputSettingObject = OmitReadonly<StreamInputSettingObject>
export type UpdateHDMIInputSettingObject = OmitReadonly<HDMIInputSettingObject>
