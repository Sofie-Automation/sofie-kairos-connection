import { OmitReadonly } from '../lib/omit-readonly.js'

export interface IpOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number

	/** string : format (Added in 2.0)*/
	format: string
	/** enum : frequency (Added in 2.0)*/
	frequency: FrequencyEnum
	/** enum : color_model (Added in 2.0)*/
	colorModel: ColorModel
	/** enum : bitdepth (Added in 2.0)*/
	bitDepth: BitDepth
	/** enum : SDP_Colorspace (Added in 2.0)*/
	SDPColorspace: SDPColorspace
	/** enum : SDP_Tcs (Added in 2.0)*/
	SDPTcs: SDPTcs
	/**
	 * ObjectID : compare (Added in 2.0)
	 * @deprecated Unknown what this is used for. This will be likely changed into a Ref-type in future versions
	 */
	compare: string // ObjectId. Unknown what this is used for
}
export interface SDIOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number

	/**
	 * ObjectID : compare
	 * (Added in 2.0)
	 * @deprecated Unknown what this is used for. This will be likely changed into a Ref-type in future versions
	 */
	compare: string // ObjectId
}
export interface NDIOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 12 ] **/
	delay: number

	/**
	 * ObjectID : compare
	 * (Added in 2.0)
	 * @deprecated Unknown what this is used for. This will be likely changed into a Ref-type in future versions
	 */
	compare: string // ObjectId
}
export interface StreamOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number

	/**
	 * ObjectID : compare
	 * (Added in 2.0)
	 * @deprecated Unknown what this is used for. This will be likely changed into a Ref-type in future versions
	 */
	compare: string // ObjectId
}
export interface AudioOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number
}
/** Added in 2.0 */
export interface HDMIOutputSettingObject {
	/** int : status [ read_only ] **/
	readonly status: number
	/** string : status_text [ read_only ] **/
	readonly statusText: string
	/** int : delay [ min: 0 | max: 30 ] **/
	delay: number

	/**
	 * ObjectID : compare
	 * @deprecated Unknown what this is used for. This will be likely changed into a Ref-type in future versions
	 */
	compare: string // ObjectId. Unknown what this is used for
}

// --------- Types --------------------------------------------------------------------------

export enum FrequencyEnum {
	'NOT_SUPPORTED' = 'NOT_SUPPORTED',

	'23hz' = '23 hz', // 23
	'24hz' = '24 hz', // 24
	'25hz' = '25 hz', // 25
	'29hz' = '29 hz', // 29
	'30hz' = '30 hz', // 30
	'50hz' = '50 hz', // 50
	'59hz' = '59 hz', // 59
	'60hz' = '60 hz', // 60
}
export enum ColorModel {
	'NOT_SUPPORTED' = 'NOT_SUPPORTED',

	'YCbCr422' = 'YCbCr422', // 1
	'YCbCr444' = 'YCbCr444', // 2
	'RGB' = 'RGB', // 6
	'RGBA' = 'RGBA', // 7
	'Key' = 'Key', // 8
}
export enum BitDepth {
	'NOT_SUPPORTED' = 'NOT_SUPPORTED',

	'8Bit' = '8-Bit', // 8
	'10Bit' = '10-Bit', // 10
	'12Bit' = '12-Bit', // 12
}
export enum SDPColorspace {
	'NOT_SUPPORTED' = 'NOT_SUPPORTED',

	'BT709' = 'BT709', // 0
	'BT2020' = 'BT2020', // 1
	'BT2100' = 'BT2100', // 2
}
export enum SDPTcs {
	'NOT_SUPPORTED' = 'NOT_SUPPORTED',

	'SDR' = 'SDR', // 0
	'HLG' = 'HLG', // 1
	'PQ' = 'PQ', // 2
}
// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateIpOutputSettingObject = OmitReadonly<IpOutputSettingObject>
export type UpdateSDIOutputSettingObject = OmitReadonly<SDIOutputSettingObject>
export type UpdateNDIOutputSettingObject = OmitReadonly<NDIOutputSettingObject>
export type UpdateStreamOutputSettingObject = OmitReadonly<StreamOutputSettingObject>
export type UpdateAudioOutputSettingObject = OmitReadonly<AudioOutputSettingObject>
export type UpdateHDMIOutputSettingObject = OmitReadonly<HDMIOutputSettingObject>
