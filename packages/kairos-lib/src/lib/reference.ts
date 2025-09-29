import { protocolDecodePath, protocolEncodeStr, RefPath, RefPathSingle } from './encode-decode.js'
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
	| SceneTransitionRef
	| SceneTransitionMixRef
	| SceneTransitionMixEffectRef
	| SceneSnapshotRef
	| MacroRef
	| RamRecorderRef
	| ClipPlayerRef
	| ImageStoreRef
	| SourceBaseRef
	| SourceIntRef
	| GfxSceneRef
	| GfxSceneItemRef
	| AudioMixerChannelRef
	| MattesRef
	| AuxRef
	| AuxEffectRef
	| InputRef
	| FxInputRef
	| MatteRef

export function isRef(ref: unknown): ref is AnyRef {
	if (typeof ref !== 'object' || ref === null) return false
	if (!('realm' in ref) || typeof ref.realm !== 'string') return false
	return true
}

/** Any refs that can be used as sources */
export type SourceRef =
	| RamRecorderRef
	| ClipPlayerRef
	| ImageStoreRef
	| SourceBaseRef
	| SourceIntRef
	| SceneRef
	| MattesRef
	| AuxRef
	| InputRef

export function isSourceRef(ref: AnyRef): ref is SourceRef {
	return (
		ref.realm === 'ramRecorder' ||
		ref.realm === 'clipPlayer' ||
		ref.realm === 'imageStore' ||
		ref.realm === 'source-base' ||
		ref.realm === 'source-int' ||
		ref.realm === 'scene' ||
		ref.realm === 'mattes' ||
		ref.realm === 'aux' ||
		ref.realm === 'input'
	)
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
		case 'scene-transition':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Transitions',
				...ref.transitionPath.map(protocolEncodeStr),
			].join('.')
		case 'scene-transition-mix':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Transitions',
				...ref.transitionPath.map(protocolEncodeStr),
				...ref.mixPath.map(protocolEncodeStr),
			].join('.')
		case 'scene-transition-mix-effect':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Transitions',
				...ref.transitionPath.map(protocolEncodeStr),
				...ref.mixPath.map(protocolEncodeStr),
				...ref.effectPath.map(protocolEncodeStr),
			].join('.')
		case 'scene-snapshot':
			return [
				'SCENES',
				...ref.scenePath.map(protocolEncodeStr),
				'Snapshots',
				...ref.snapshotPath.map(protocolEncodeStr),
			].join('.')
		case 'macro':
			return ['MACROS', ...ref.macroPath.map(protocolEncodeStr)].join('.')
		case 'source-base':
			return [...ref.path.map(protocolEncodeStr)].join('.')
		case 'source-int':
			return ['INTSOURCES', ...ref.path.map(protocolEncodeStr)].join('.')
		case 'ramRecorder':
			return [...ref.path].join('.')
		case 'clipPlayer':
			return [...ref.path].join('.')
		case 'imageStore':
			return [...ref.path].join('.')
		case 'gfxScene':
			return ['GFXSCENES', ...ref.scenePath.map(protocolEncodeStr)].join('.')
		case 'gfxScene-item':
			return ['GFXSCENES', ...ref.scenePath.map(protocolEncodeStr), ...ref.sceneItemPath.map(protocolEncodeStr)].join(
				'.'
			)
		case 'audioMixer-channel':
			return ['AUDIOMIXER', ...ref.channelPath.map(protocolEncodeStr)].join('.')
		case 'mattes':
			return ['MATTES', ...ref.path.map(protocolEncodeStr)].join('.')
		case 'aux': {
			const path = [protocolEncodeStr(ref.path)]
			if (ref.pathIsName) path.unshift('AUX')
			return path.join('.')
		}
		case 'aux-effect': {
			const path = [protocolEncodeStr(ref.auxPath), 'Effects', ...ref.effectPath.map(protocolEncodeStr)]
			if (ref.auxPathIsName) path.unshift('AUX')
			return path.join('.')
		}
		case 'input':
			return protocolEncodeStr(ref.path)
		case 'fxInput':
			return ['FXINPUTS', ...ref.fxInputPath.map(protocolEncodeStr)].join('.')
		case 'matte':
			return ['MATTES', ...ref.mattePath.map(protocolEncodeStr)].join('.')
		default:
			assertNever(ref)

			throw new Error(`Unknown ref: ${JSON.stringify(ref)}`)
	}
}
export function pathRoRef(ref: string): AnyRef | string {
	const path = protocolDecodePath(ref)

	if (path[0] === 'SCENES') {
		if (path.includes('Layers')) {
			const paths = splitPath(
				path.slice(1), // Omit 'SCENES'
				'Layers',
				'Effects'
			)
			const sceneRef = refScene(paths[0])

			if (paths.length >= 2) {
				const layerRef = refSceneLayer(sceneRef, paths[1])
				if (paths.length === 3) return refSceneLayerEffect(layerRef, paths[2])
				return layerRef
			}
		} else if (path.includes('Transitions')) {
			const paths = splitPath(
				path.slice(1), // Omit 'SCENES'
				'Transitions'
			)
			const sceneRef = refScene(paths[0])
			if (paths.length === 2) {
				if (paths[1].length >= 1) {
					const transitionRef = refSceneTransition(sceneRef, [paths[1][0]])
					if (paths[1].length >= 2) {
						const transitionMixRef = refSceneTransitionMix(transitionRef, [paths[1][1]])
						if (paths[1].length === 3) return refSceneTransitionMixEffect(transitionMixRef, [paths[1][2]])
						return transitionMixRef
					}
					return transitionRef
				}
			}
		} else if (path.includes('Snapshots')) {
			const paths = splitPath(
				path.slice(1), // Omit 'SCENES'
				'Snapshots'
			)
			const sceneRef = refScene(paths[0])
			if (paths.length === 2) {
				return refSceneSnapshot(sceneRef, paths[1])
			}
		} else {
			return refScene(
				path.slice(1) // Omit 'SCENES'
			)
		}
	} else if (path[0] === 'MEDIA') {
		if (path[1] === 'clips') {
			return refMediaClip(path.slice(2))
		} else if (path[1] === 'stills') {
			return refMediaStill(path.slice(2))
		} else if (path[1] === 'ramrec') {
			return refMediaRamRec(path.slice(2))
		} else if (path[1] === 'images') {
			return refMediaImage(path.slice(2))
		} else if (path[1] === 'sounds') {
			return refMediaSound(path.slice(2))
		}
	} else if (path[0] === 'MACROS') {
		return refMacro(path.slice(1))
	} else if (path[0].startsWith('RR')) {
		if (path.length === 1) {
			const path0 = path[0] as RamRecorderRef['path'][0]
			if (
				path0 === 'RR1' ||
				path0 === 'RR2' ||
				path0 === 'RR3' ||
				path0 === 'RR4' ||
				path0 === 'RR5' ||
				path0 === 'RR6' ||
				path0 === 'RR7' ||
				path0 === 'RR8'
			) {
				return refRamRecorder([path0])
			} else {
				assertNever(path0)
			}
		}
	} else if (path[0].startsWith('CP')) {
		if (path.length === 1) {
			const path0 = path[0] as ClipPlayerRef['path'][0]
			if (path0 === 'CP1' || path0 === 'CP2') {
				return refClipPlayer([path0])
			} else {
				assertNever(path0)
			}
		}
	} else if (path[0].startsWith('IS')) {
		if (path.length === 1) {
			const path0 = path[0] as ImageStoreRef['path'][0]
			if (
				path0 === 'IS1' ||
				path0 === 'IS2' ||
				path0 === 'IS3' ||
				path0 === 'IS4' ||
				path0 === 'IS5' ||
				path0 === 'IS6' ||
				path0 === 'IS7' ||
				path0 === 'IS8'
			) {
				return refImageStore([path0])
			} else {
				assertNever(path0)
			}
		}
	} else if (path[0] === 'BLACK' || path[0] === 'WHITE') {
		return refSourceBase([path[0]])
	} else if (path[0] === 'INTSOURCES') {
		if (path.length === 2) {
			const path1 = path[1] as SourceIntRef['path'][0]
			if (
				path1 === 'ColorBar' ||
				path1 === 'ColorCircle' ||
				path1 === 'MV1' ||
				path1 === 'MV2' ||
				path1 === 'MV3' ||
				path1 === 'MV4'
			) {
				return refSourceInt([path1])
			} else {
				assertNever(path1)
			}
		}
	} else if (path[0] === 'MATTES') {
		return refMattes(path.slice(1))
	} else if (path[0] === 'GFXSCENES') {
		return refGfxScene(path.slice(1))
	} else if (path[0] === 'AUX') {
		if (path.length === 2) {
			return refAuxName(path[1])
		}
	} else if (path[0].includes('-AUX')) {
		// Auxes are often refered to without the prefix
		if (path.length === 1) {
			return refAuxId(path[0])
		}
	} else if (
		path[0].startsWith('IP') ||
		path[0].startsWith('NDI') ||
		path[0].startsWith('STREAM') ||
		path[0].startsWith('SDI')
	) {
		if (path.length === 1) {
			// Inputs are refered to without a prefix
			return refInput(path[0])
		}
	}

	// If nothing else matched, return the original string
	return ref
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

export type SceneTransitionRef = {
	realm: 'scene-transition'
	scenePath: RefPath
	transitionPath: RefPathSingle
}
export function refSceneTransition(sceneRef: SceneRef, transitionPath: RefPathSingle): SceneTransitionRef {
	return { realm: 'scene-transition', scenePath: sceneRef.scenePath, transitionPath }
}
export type SceneTransitionMixRef = {
	realm: 'scene-transition-mix'
	scenePath: RefPath
	transitionPath: RefPathSingle
	mixPath: RefPathSingle
}
export function refSceneTransitionMix(
	transitionRef: SceneTransitionRef,
	mixPath: RefPathSingle
): SceneTransitionMixRef {
	return {
		realm: 'scene-transition-mix',
		scenePath: transitionRef.scenePath,
		transitionPath: transitionRef.transitionPath,
		mixPath,
	}
}
export type SceneTransitionMixEffectRef = {
	realm: 'scene-transition-mix-effect'
	scenePath: RefPath
	transitionPath: RefPathSingle
	mixPath: RefPathSingle
	effectPath: RefPathSingle
}
export function refSceneTransitionMixEffect(
	mixRef: SceneTransitionMixRef,
	effectPath: RefPathSingle
): SceneTransitionMixEffectRef {
	return {
		realm: 'scene-transition-mix-effect',
		scenePath: mixRef.scenePath,
		transitionPath: mixRef.transitionPath,
		mixPath: mixRef.mixPath,
		effectPath,
	}
}

export type FxInputRef = {
	realm: 'fxInput'
	fxInputPath: RefPath
}
export function refFxInput(fxInputPath: RefPath): FxInputRef {
	return { realm: 'fxInput', fxInputPath }
}
export type MatteRef = {
	realm: 'matte'
	mattePath: RefPath
}
export function refMatte(mattePath: RefPath): MatteRef {
	return { realm: 'matte', mattePath }
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

// ---------------------------- RAMRECORDERS ---------------------------
export type RamRecorderRef = {
	realm: 'ramRecorder'
	path: ['RR1' | 'RR2' | 'RR3' | 'RR4' | 'RR5' | 'RR6' | 'RR7' | 'RR8']
}
export function refRamRecorder(path: RamRecorderRef['path']): RamRecorderRef {
	return { realm: 'ramRecorder', path }
}
// ---------------------------- PLAYERS --------------------------------

export type ClipPlayerRef = {
	realm: 'clipPlayer'
	path: ['CP1' | 'CP2']
}
export function refClipPlayer(path: ClipPlayerRef['path']): ClipPlayerRef {
	return { realm: 'clipPlayer', path }
}
// ---------------------------- IMAGESTORES ----------------------------
export type ImageStoreRef = {
	realm: 'imageStore'
	path: ['IS1' | 'IS2' | 'IS3' | 'IS4' | 'IS5' | 'IS6' | 'IS7' | 'IS8']
}
export function refImageStore(path: ImageStoreRef['path']): ImageStoreRef {
	return { realm: 'imageStore', path }
}

// ---------------------------- GFXSCENES ------------------------------
export type GfxSceneRef = {
	realm: 'gfxScene'
	scenePath: RefPath
}
export type GfxSceneItemRef = {
	realm: 'gfxScene-item'
	scenePath: RefPath
	sceneItemPath: RefPath
}
export function refGfxScene(scenePath: RefPath): GfxSceneRef {
	return { realm: 'gfxScene', scenePath }
}
export function refGfxSceneItem(scenePath: GfxSceneRef, sceneItemPath: RefPath): GfxSceneItemRef {
	return { realm: 'gfxScene-item', scenePath: scenePath.scenePath, sceneItemPath }
}

// ---------------------------- INTSOURCES -----------------------------

export type SourceBaseRef = {
	realm: 'source-base'
	path: ['BLACK' | 'WHITE']
}
export function refSourceBase(path: SourceBaseRef['path']): SourceBaseRef {
	return { realm: 'source-base', path }
}

export type SourceIntRef = {
	realm: 'source-int'
	path: ['ColorBar' | 'ColorCircle' | 'MV1' | 'MV2' | 'MV3' | 'MV4']
}
export function refSourceInt(path: SourceIntRef['path']): SourceIntRef {
	return { realm: 'source-int', path }
}

// ------------------------ AUDIOMIXER Channels -------------------------
export type AudioMixerChannelRef = {
	realm: 'audioMixer-channel'
	channelPath: RefPath
}
export function refAudioMixerChannel(channelPath: RefPath): AudioMixerChannelRef {
	return { realm: 'audioMixer-channel', channelPath }
}

// ------------------------------- MATTES ------------------------------
export type MattesRef = {
	realm: 'mattes'
	path: RefPath
}
export function refMattes(path: MattesRef['path']): MattesRef {
	return { realm: 'mattes', path }
}

export type AuxRef = {
	realm: 'aux'
	path: string
	pathIsName: boolean // true if the path is a name, false if it is an id
}
export function refAuxId(path: AuxRef['path']): AuxRef {
	return { realm: 'aux', path, pathIsName: false }
}
export function refAuxName(path: AuxRef['path']): AuxRef {
	return { realm: 'aux', path, pathIsName: true }
}

export type InputRef = {
	realm: 'input'
	path: string
	// pathIsName: boolean // true if the path is a name, false if it is an id
}
export function refInput(path: InputRef['path']): InputRef {
	return { realm: 'input', path }
}

export type AuxEffectRef = {
	realm: 'aux-effect'
	auxPath: string
	auxPathIsName: boolean //
	effectPath: RefPath
}
export function refAuxEffect(auxRef: AuxRef, effectPath: RefPath): AuxEffectRef {
	return { realm: 'aux-effect', auxPath: auxRef.path, auxPathIsName: auxRef.pathIsName, effectPath }
}
