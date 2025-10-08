import { OmitReadonly } from '../lib/omit-readonly.js'

export interface IpInputObject {
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
export interface SDIInputObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
	/** int : delay [ min: 0 | max: 12 ] */
	delay: number
}
export interface NDIInputObject {
	/** int : status [ read_only ] */
	readonly status: number
	/** string : status_text [ read_only ] */
	readonly statusText: string
	/** int : tally [ read_only ] */
	readonly tally: number
}
export interface StreamInputObject {
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

export type UpdateIpInputObject = OmitReadonly<IpInputObject>
export type UpdateSDIInputObject = OmitReadonly<SDIInputObject>
export type UpdateNDIInputObject = OmitReadonly<NDIInputObject>
export type UpdateStreamInputObject = OmitReadonly<StreamInputObject>
