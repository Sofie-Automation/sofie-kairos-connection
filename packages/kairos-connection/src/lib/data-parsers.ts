import { Pos3Df, Pos2Df, Pos2D, ColorRGB } from '../kairos-types/main.js'
import {
	GfxSceneRef,
	isRef,
	isSourceRef,
	MediaClipRef,
	MediaRamRecRef,
	MediaSoundRef,
	pathRoRef,
	refToPath,
	SceneTransitionRef,
	SourceRef,
} from './reference.js'

export function passThroughString(value: string): string
export function passThroughString(value: string | undefined): string | undefined
export function passThroughString(value: string | undefined): string | undefined {
	return value
}

export function parseBoolean(value: string): boolean {
	if (value === '1') return true
	if (value === '0') return false
	throw new Error(`Unable to parse boolean from string: "${value}"`)
}
export function stringifyBoolean(value: boolean): string
export function stringifyBoolean(value: undefined): undefined
export function stringifyBoolean(value: boolean | undefined): string | undefined
export function stringifyBoolean(value: boolean | undefined): string | undefined {
	if (value === undefined) return undefined
	return value ? '1' : '0'
}
export function parseCommaSeparated(value: string): string[] {
	return value.split(',').filter((v) => v.trim() !== '')
}
export function stringifyCommaSeparated(values: string[]): string
export function stringifyCommaSeparated(values: undefined): undefined
export function stringifyCommaSeparated(values: string[] | undefined): string | undefined
export function stringifyCommaSeparated(values: string[] | undefined): string | undefined {
	if (values === undefined) return undefined
	return values.join(',')
	// TODO:end with a ',' ?
}

export function parseInteger(value: string): number {
	const parsed = parseInt(value, 10)
	if (isNaN(parsed)) throw new Error(`Unable to parse integer from string: "${value}"`)
	return parsed
}
export function stringifyInteger(value: undefined): undefined
export function stringifyInteger(value: number): string
export function stringifyInteger(value: number | undefined): string | undefined
export function stringifyInteger(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function parseFloatValue(value: string): number {
	const parsed = parseFloat(value)
	if (isNaN(parsed)) throw new Error(`Unable to parse float from string: "${value}"`)
	return parsed
}
export function stringifyFloat(value: undefined): undefined
export function stringifyFloat(value: number): string
export function stringifyFloat(value: number | undefined): string | undefined
export function stringifyFloat(value: number | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.toString()
}
export function parseEnum<EnumType>(value: string, theEnum: { [key: string]: any }): EnumType {
	const values = Object.values<any>(theEnum)
	if (values.includes(value)) return value as any

	throw new Error(`Invalid enum value: ${JSON.stringify(value)}, valid values: ${values.join(', ')}`)
}
export function stringifyEnum(value: undefined, theEnum: { [key: string]: any }): undefined
export function stringifyEnum<EnumType>(value: EnumType, theEnum: { [key: string]: any }): string
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined
export function stringifyEnum<EnumType>(
	value: EnumType | undefined,
	theEnum: { [key: string]: any }
): string | undefined {
	if (value === undefined) return undefined

	const values = Object.values<any>(theEnum)

	if (values.includes(value)) return value as any

	throw new Error(`Invalid enum value: ${JSON.stringify(value)}, valid values: ${values.join(', ')}`)
}

export function parsePos3Df(value: string): Pos3Df {
	const parts = value.split('/')
	if (parts.length !== 3) throw new Error(`Unable to parse Pos3Df from string: "${value}"`)

	return {
		x: parseFloatValue(parts[0]),
		y: parseFloatValue(parts[1]),
		z: parseFloatValue(parts[2]),
	}
}

export function stringifyPos3Df(pos: Pos3Df | undefined): string | undefined {
	if (pos === undefined) return undefined
	return `${pos.x}/${pos.y}/${pos.z}`
}

export function parsePos2Df(value: string): Pos2Df {
	const parts = value.split('/')
	if (parts.length !== 2) throw new Error(`Unable to parse Pos2Df from string: "${value}"`)

	return {
		x: parseFloatValue(parts[0]),
		y: parseFloatValue(parts[1]),
	}
}

export function stringifyPos2Df(pos: Pos2Df | undefined): string | undefined {
	if (pos === undefined) return undefined
	return `${pos.x}/${pos.y}`
}

export function parsePos2D(value: string): Pos2D {
	const parts = value.split('/')
	if (parts.length !== 2) throw new Error(`Unable to parse Pos2D from string: "${value}"`)

	return {
		x: parseInteger(parts[0]),
		y: parseInteger(parts[1]),
	}
}

export function stringifyPos2D(pos: Pos2D | undefined): string | undefined {
	if (pos === undefined) return undefined
	return `${pos.x}/${pos.y}`
}

export function parseColorRGB(value: string): ColorRGB {
	// value is rgb(255,255,255)

	const match = value.match(/^rgb\((\d+),(\d+),(\d+)\)$/)
	if (match) {
		return {
			red: parseInteger(match[1]),
			green: parseInteger(match[2]),
			blue: parseInteger(match[3]),
		}
	}
	throw new Error(`Unable to parse ColorRGB from string: "${value}"`)
}

export function stringifyColorRGB(color: ColorRGB | undefined): string | undefined {
	if (color === undefined) return undefined
	// return `${color.red}/${color.green}/${color.blue}`
	return `rgb(${color.red},${color.green},${color.blue})`
}

export function parseSourceRefOptional(value: string): SourceRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseSourceRef(value)
}
export function parseSourceRef(value: string): SourceRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse SourceRef from string: "${value}"`)
	if (!isSourceRef(ref)) throw new Error(`Unable to parse SourceRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}

export function stringifySourceRef(ref: undefined): undefined
export function stringifySourceRef(ref: null): '<unknown>'
export function stringifySourceRef(ref: string): string
export function stringifySourceRef(ref: SourceRef): string
export function stringifySourceRef(ref: SourceRef | string): string
export function stringifySourceRef(ref: SourceRef | null | undefined): string | undefined
export function stringifySourceRef(ref: SourceRef | string | undefined): string | undefined
export function stringifySourceRef(ref: SourceRef | string | undefined): string | undefined
export function stringifySourceRef(ref: SourceRef | string | null | undefined): string | undefined
export function stringifySourceRef(ref: SourceRef | string | null | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (ref === null) return '<unknown>'
	if (typeof ref === 'string') return ref

	return refToPath(ref)
}

export function parseMediaClipRefOptional(value: string): MediaClipRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseMediaClipRef(value)
}
export function parseMediaClipRef(value: string): MediaClipRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse MediaClipRef from string: "${value}"`)
	if (ref.realm !== 'media-clip')
		throw new Error(`Unable to parse MediaClipRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}
export function stringifyMediaClipRef(ref: MediaClipRef): string
export function stringifyMediaClipRef(ref: null): string
export function stringifyMediaClipRef(ref: MediaClipRef | null): string
export function stringifyMediaClipRef(ref: MediaClipRef | string | null | undefined): string | undefined
export function stringifyMediaClipRef(ref: MediaClipRef | string | null | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (ref === null) return ''
	if (typeof ref === 'string') return ref

	if (ref.realm !== 'media-clip') throw new Error(`Unable to stringify MediaClipRef, is a "${ref.realm}"`)

	return refToPath(ref)
}
export function parseMediaRamRecRefOptional(value: string): MediaRamRecRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseMediaRamRecRef(value)
}
export function parseMediaRamRecRef(value: string): MediaRamRecRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse MediaRamRecRef from string: "${value}"`)
	if (ref.realm !== 'media-ramrec')
		throw new Error(`Unable to parse MediaRamRecRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}
export function stringifyMediaRamRecRef(ref: MediaRamRecRef | null): string
export function stringifyMediaRamRecRef(ref: MediaRamRecRef | string | null | undefined): string | undefined
export function stringifyMediaRamRecRef(ref: MediaRamRecRef | string | null | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (ref === null) return ''
	if (typeof ref === 'string') return ref

	if (ref.realm !== 'media-ramrec') throw new Error(`Unable to stringify MediaRamRecRef, is a "${ref.realm}"`)

	return refToPath(ref)
}

export function parseMediaSoundRefOptional(value: string): MediaSoundRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseMediaSoundRef(value)
}
export function parseMediaSoundRef(value: string): MediaSoundRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse MediaSoundRef from string: "${value}"`)
	if (ref.realm !== 'media-sound')
		throw new Error(`Unable to parse MediaSoundRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}
export function stringifyMediaSoundRef(ref: MediaSoundRef | null): string
export function stringifyMediaSoundRef(ref: MediaSoundRef | string | null | undefined): string | undefined
export function stringifyMediaSoundRef(ref: MediaSoundRef | string | null | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (ref === null) return ''
	if (typeof ref === 'string') return ref

	if (ref.realm !== 'media-sound') throw new Error(`Unable to stringify MediaSoundRef, is a "${ref.realm}"`)

	return refToPath(ref)
}

export function parseSceneTransitionRef(value: string): SceneTransitionRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse SourceRef from string: "${value}"`)
	if (ref.realm !== 'scene-transition')
		throw new Error(`Unable to parse SceneTransitionRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}

export function stringifySceneTransitionRef(ref: undefined): undefined
export function stringifySceneTransitionRef(ref: string): string
export function stringifySceneTransitionRef(ref: SceneTransitionRef): string
export function stringifySceneTransitionRef(ref: SceneTransitionRef | string): string
export function stringifySceneTransitionRef(ref: SceneTransitionRef | string | undefined): string | undefined
export function stringifySceneTransitionRef(ref: SceneTransitionRef | string | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (typeof ref === 'string') return ref

	return refToPath(ref)
}

export function parseGfxSceneRef(value: string): GfxSceneRef {
	const ref = pathRoRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse GfxSceneRef from string: "${value}"`)
	if (ref.realm !== 'gfxScene') throw new Error(`Unable to parse GfxSceneRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}

export function stringifyGfxSceneRef(ref: undefined): undefined
export function stringifyGfxSceneRef(ref: string): string
export function stringifyGfxSceneRef(ref: GfxSceneRef): string
export function stringifyGfxSceneRef(ref: GfxSceneRef | string): string
export function stringifyGfxSceneRef(ref: GfxSceneRef | string | undefined): string | undefined
export function stringifyGfxSceneRef(ref: GfxSceneRef | string | null | undefined): string | undefined {
	if (ref === undefined) return undefined
	if (ref === null) return '<unknown>'
	if (typeof ref === 'string') return ref

	return refToPath(ref)
}
