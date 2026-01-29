import {
	Pos3Df,
	Pos2Df,
	Pos2D,
	ColorRGB,
	isRef,
	pathToRef,
	refToPath,
	AnySourceRef,
	AnyRef,
	MediaStillRef,
	MediaImageRef,
	AnyMVSourceRef,
} from 'kairos-lib'
import { parseAnyMVSourceRef, parseAnySourceRef, parseRef } from './refs.js'

export function parseRefOptional<Ref extends AnyRef>(realm: Ref['realm'], value: string): Ref | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseRef(realm, value)
}

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

export function parseString(value: string): string {
	return value
}
export function stringifyString(value: undefined): undefined
export function stringifyString(value: string): string
export function stringifyString(value: string | undefined): string | undefined
export function stringifyString(value: string | undefined): string | undefined {
	if (value === undefined) return undefined
	return `${value}`
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
	else if (values.includes(parseInt(value, 10))) return parseInt(value, 10) as any

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
	else if (values.includes(`${value}`)) return `${value}`

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

export function parseAnySourceRefOptional(value: string): AnySourceRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources
	return parseAnySourceRef(value)
}

export function stringifyAnySourceRef(ref: undefined): undefined
export function stringifyAnySourceRef(ref: null): '<unknown>'
export function stringifyAnySourceRef(ref: string): string
export function stringifyAnySourceRef(ref: AnySourceRef): string
export function stringifyAnySourceRef(ref: AnySourceRef | string): string
export function stringifyAnySourceRef(ref: AnySourceRef | null | undefined): string | undefined
export function stringifyAnySourceRef(ref: AnySourceRef | string | undefined): string | undefined
export function stringifyAnySourceRef(ref: AnySourceRef | string | undefined): string | undefined
export function stringifyAnySourceRef(ref: AnySourceRef | string | null | undefined): string | undefined
export function stringifyAnySourceRef(ref: AnySourceRef | string | null | undefined): string | undefined {
	if (typeof ref === 'string') {
		// pass through parseAnySourceRef to ensure that the string is of the correct type / realm:
		ref = parseAnySourceRef(ref)
	}
	if (ref === undefined) return undefined
	if (ref === null) return '<unknown>'

	return refToPath(ref)
}

export function stringifyAnyMVSourceRef(ref: AnyMVSourceRef | string | null | undefined): string | undefined {
	if (typeof ref === 'string') {
		// pass through parseAnyMVSourceRef to ensure that the string is of the correct type / realm:
		ref = parseAnyMVSourceRef(ref)
	}
	if (ref === undefined) return undefined
	if (ref === null) return '<unknown>'

	return refToPath(ref)
}

export function parseImageStoreClip(value: string): MediaStillRef | MediaImageRef | null {
	if (value === '<unknown>') return null as any // This is a special case for undefined sources

	const ref = pathToRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse string: "${value}"`)
	if (ref.realm !== 'media-still' && ref.realm !== 'media-image') {
		throw new Error(`Unable to parse string: "${value}", is a "${ref.realm}" expected "media-still" or "media-image"`)
	}

	return ref
}
export function stringifyImageStoreClip(
	ref: MediaStillRef | MediaImageRef | string | null | undefined
): string | undefined {
	if (typeof ref === 'string') {
		// pass through parseImageStoreClip to ensure that the string is of the correct type / realm:
		ref = parseImageStoreClip(ref)
	}
	if (ref === undefined) return undefined
	if (ref === null) return ''
	// Note: we don't really know how to use a MediaImage, we assume it's valid to use it like this.

	return refToPath(ref)
}
