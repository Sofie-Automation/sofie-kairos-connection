import {
	AnyMVSourceRef,
	AnyRef,
	AnySourceRef,
	exampleRef,
	isAnyMVSourceRef,
	isAnySourceRef,
	isRef,
	pathToRef,
	refToPath,
} from 'kairos-lib'

export function stringifyRef<Ref extends AnyRef>(
	realm: Ref['realm'],
	ref: (AnyRef & { realm: Ref['realm'] }) | string | null
): string
export function stringifyRef<Ref extends AnyRef>(
	realm: Ref['realm'],
	ref: (AnyRef & { realm: Ref['realm'] }) | null
): string
export function stringifyRef<Ref extends AnyRef>(
	realm: Ref['realm'],
	ref: (AnyRef & { realm: Ref['realm'] }) | string | null | undefined
): string | undefined
export function stringifyRef<Ref extends AnyRef>(
	realm: Ref['realm'],
	ref: (AnyRef & { realm: Ref['realm'] }) | string | null | undefined
): string | undefined {
	if (typeof ref === 'string') {
		// pass through parseRef to ensure that the string is of the correct type / realm:
		ref = parseRef(realm, ref)
	}
	if (ref === undefined) return undefined
	if (ref === null) return ''

	if (realm !== ref.realm) throw new Error(`Unable to stringify ref, is a "${ref.realm}" (expected format: ${realm})`)

	return refToPath(ref)
}

export function parseRef<Ref extends AnyRef>(realm: Ref['realm'], value: string | Ref): Ref {
	const ref = typeof value === 'string' ? pathToRef(value) : value

	if (!isRef(ref))
		throw new Error(
			`Unable to parse  ${JSON.stringify(value)}, unknown format (expected "${refToPath(exampleRef(realm))}")`
		)
	if (ref.realm !== realm)
		throw new Error(`Unable to parse ${JSON.stringify(value)}, is a "${ref.realm}" (expected "${realm}")`)

	return ref as Ref
}

export function parseAnySourceRef(value: string): AnySourceRef {
	const ref = pathToRef(value)

	if (!isRef(ref)) throw new Error(`Unable to parse AnySourceRef from string: "${value}"`)
	if (!isAnySourceRef(ref)) throw new Error(`Unable to parse AnySourceRef, is a "${ref.realm}" (value: "${value}")`)

	return ref
}

export function parseAnyMVSourceRef(value: string): AnyMVSourceRef {
	const ref = pathToRef(value)
	if (!isRef(ref)) throw new Error(`Unable to parse AnyMVSourceRef from string: "${value}"`)
	if (!isAnyMVSourceRef(ref)) throw new Error(`Unable to parse AnyMVSourceRef, is a "${ref.realm}" (value: "${value}")`)
	return ref
}
