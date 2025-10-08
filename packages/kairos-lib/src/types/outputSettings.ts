import { OmitReadonly } from '../lib/omit-readonly.js'

export interface IpOutputObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface SDIOutputObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface NDIOutputObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface StreamOutputObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number
}
export interface AudioOutputObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number
}

// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateIpOutputObject = OmitReadonly<IpOutputObject>
export type UpdateSDIOutputObject = OmitReadonly<SDIOutputObject>
export type UpdateNDIOutputObject = OmitReadonly<NDIOutputObject>
export type UpdateStreamOutputObject = OmitReadonly<StreamOutputObject>
export type UpdateAudioOutputObject = OmitReadonly<AudioOutputObject>
