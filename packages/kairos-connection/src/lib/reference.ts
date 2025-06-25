import { protocolEncodeStr, RefPath } from './encode-decode.js'
import { assertNever } from './lib.js'

export type AnyRef =
	| SceneRef
	| SceneLayerRef
	| SceneLayerEffectRef
	| MediaClipRef
	| MediaStillRef
	| MediaRamRecRef
	| MediaImageRef
	| MediaSoundRef
	| SceneSnapshotRef
	| MacroRef

export function isRef(ref: unknown): ref is AnyRef {
	if (typeof ref !== 'object' || ref === null) return false
	if (!('realm' in ref) || typeof ref.realm !== 'string') return false
	return true
}
export function refToPath(ref: AnyRef): string {
	switch (ref.realm) {
		case 'scene':
			return ['SCENES', ...ref.scenePath.map(protocolEncodeStr)].join('.')
		case 'scene-layer':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Layers',
				...ref.layerPath.map(protocolEncodeStr),
			].join('.')
		case 'scene-layer-effect':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Layers',
				...ref.layerPath.map(protocolEncodeStr),
				'Effects',
				...ref.effectPath.map(protocolEncodeStr),
			].join('.')
		case 'media-clip':
			return ['MEDIA', 'clips', ...ref.clipPath.map(protocolEncodeStr)].join('.')
		case 'media-still':
			return ['MEDIA', 'stills', ...ref.clipPath.map(protocolEncodeStr)].join('.')
		case 'media-ramrec':
			return ['MEDIA', 'ramrec', ...ref.clipPath.map(protocolEncodeStr)].join('.')
		case 'media-image':
			return ['MEDIA', 'images', ...ref.clipPath.map(protocolEncodeStr)].join('.')
		case 'media-sound':
			return ['MEDIA', 'sounds', ...ref.clipPath.map(protocolEncodeStr)].join('.')
		case 'scene-snapshot':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Snapshots',
				...ref.snapshotPath.map(protocolEncodeStr),
			].join('.')
		case 'macro':
			return ['MACROS', ...ref.macroPath.map(protocolEncodeStr)].join('.')
		default:
			assertNever(ref)
			throw new Error(`Unknown ref: ${JSON.stringify(ref)}`)
	}
}

/**
 * Splits a RefPath into multiple paths based on the provided splits.
 * example: splitPath(['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'], 'Layers')
 * returns [['SCENES', 'Scene1'], ['LayerGroup', 'Layer1']]
 */
export function splitPath(path: RefPath, ...splits: string[]): RefPath[] {
	const splitPaths: RefPath[] = []

	let currentPath: RefPath = []
	for (const segment of path) {
		if (splits.includes(segment)) {
			if (currentPath.length > 0) {
				splitPaths.push(currentPath)
			}
			currentPath = []
		} else {
			currentPath.push(segment)
		}
	}

	// if (currentPath.length > 0)
	splitPaths.push(currentPath)

	return splitPaths
}

// ---------------------------- SCENES -----------------------------

export type SceneRef = {
	realm: 'scene'
	scenePath: RefPath
}
export function refScene(scenePath: RefPath): SceneRef {
	return { realm: 'scene', scenePath }
}
export type SceneLayerRef = {
	realm: 'scene-layer'
	scenePath: RefPath
	layerPath: RefPath
}
export function refSceneLayer(sceneRef: SceneRef, layerPath: RefPath): SceneLayerRef {
	return { realm: 'scene-layer', scenePath: sceneRef.scenePath, layerPath }
}
export type SceneLayerEffectRef = {
	realm: 'scene-layer-effect'
	scenePath: RefPath
	layerPath: RefPath
	effectPath: RefPath
}
export function refSceneLayerEffect(layerRef: SceneLayerRef, effectPath: RefPath): SceneLayerEffectRef {
	return { realm: 'scene-layer-effect', scenePath: layerRef.scenePath, layerPath: layerRef.layerPath, effectPath }
}
export type SceneSnapshotRef = {
	realm: 'scene-snapshot'
	scenePath: RefPath
	snapshotPath: RefPath
}
export function refSceneSnapshot(sceneRef: SceneRef, snapshotPath: RefPath): SceneSnapshotRef {
	return { realm: 'scene-snapshot', scenePath: sceneRef.scenePath, snapshotPath }
}

// ---------------------------- MEDIA -----------------------------

export type MediaClipRef = {
	realm: 'media-clip'
	clipPath: RefPath
}
export type MediaStillRef = {
	realm: 'media-still'
	clipPath: RefPath
}
export type MediaRamRecRef = {
	realm: 'media-ramrec'
	clipPath: RefPath
}
export type MediaImageRef = {
	realm: 'media-image'
	clipPath: RefPath
}
export type MediaSoundRef = {
	realm: 'media-sound'
	clipPath: RefPath
}
export function refMediaClip(clipPath: RefPath): MediaClipRef {
	return { realm: 'media-clip', clipPath }
}
export function refMediaStill(clipPath: RefPath): MediaStillRef {
	return { realm: 'media-still', clipPath }
}
export function refMediaRamRec(clipPath: RefPath): MediaRamRecRef {
	return { realm: 'media-ramrec', clipPath }
}
export function refMediaImage(clipPath: RefPath): MediaImageRef {
	return { realm: 'media-image', clipPath }
}
export function refMediaSound(clipPath: RefPath): MediaSoundRef {
	return { realm: 'media-sound', clipPath }
}

// ---------------------------- MACROS -----------------------------
export type MacroRef = {
	realm: 'macro'
	macroPath: RefPath
}
export function refMacro(macroPath: RefPath): MacroRef {
	return { realm: 'macro', macroPath }
}
