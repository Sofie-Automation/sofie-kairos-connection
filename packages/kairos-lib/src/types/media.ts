import { OmitReadonly } from '../lib/omit-readonly.js'

export interface MediaObject {
	name: string
	/** int, 0 = not loaded, 1 = loading, 2 = loaded, 3 = error */
	status: MediaStatus
	/** float, 0.0-1.0 */
	readonly loadProgress: number
}

export enum MediaStatus {
	NOT_LOADED = 0,
	LOADING = 1,
	LOAD = 2,
	ERROR = 3,
}

export type UpdateMediaObject = OmitReadonly<MediaObject>
