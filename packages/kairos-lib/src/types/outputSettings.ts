import { OmitReadonly } from '../lib/omit-readonly.js'

export interface IpOutputSettingObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface SDIOutputSettingObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface NDIOutputSettingObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number
}
export interface StreamOutputSettingObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number
}
export interface AudioOutputSettingObject {
	/** int : status [ read_only ] **/
	status: number
	/** string : status_text [ read_only ] **/
	statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number
}

// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateIpOutputSettingObject = OmitReadonly<IpOutputSettingObject>
export type UpdateSDIOutputSettingObject = OmitReadonly<SDIOutputSettingObject>
export type UpdateNDIOutputSettingObject = OmitReadonly<NDIOutputSettingObject>
export type UpdateStreamOutputSettingObject = OmitReadonly<StreamOutputSettingObject>
export type UpdateAudioOutputSettingObject = OmitReadonly<AudioOutputSettingObject>
