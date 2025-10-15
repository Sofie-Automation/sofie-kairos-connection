export type ColorRGB = {
	/** 0 - 255 */
	red: number
	/** 0 - 255 */
	green: number
	/** 0 - 255 */
	blue: number
}

export interface Pos3Df {
	x: number
	y: number
	z: number
}

export interface Pos2Df {
	x: number
	y: number
}

export interface Pos2D {
	x: number
	y: number
}

export enum DissolveMode {
	Normal = 'Normal',
	Reverse = 'Reverse',
	Cross = 'Cross',
}

export enum Resolution {
	Resolution1280x720 = '1280x720',
	Resolution1920x1080 = '1920x1080',
	Resolution3840x2160 = '3840x2160',
}
