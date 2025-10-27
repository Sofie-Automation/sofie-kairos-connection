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
	| AudioPlayerRef
	| SourceBaseRef
	| SourceIntRef
	| GfxChannelRef
	| GfxSceneRef
	| GfxSceneItemRef
	| AudioMixerChannelRef
	| MatteRef
	| AuxRef
	| AuxEffectRef
	| IpInputRef
	| SDIInputRef
	| NDIInputRef
	| StreamInputRef
	| FxInputRef
	| IpInputSettingRef
	| SDIInputSettingRef
	| NDIInputSettingRef
	| StreamInputSettingRef
	| IpOutputSettingRef
	| SDIOutputSettingRef
	| NDIOutputSettingRef
	| StreamOutputSettingRef
	| AudioOutputSettingRef
	| SourceIntMVRef
	| MultiViewRef
	| MultiViewPipRef
	| MultiViewInputRef

export function isRef(ref: unknown): ref is AnyRef {
	if (typeof ref !== 'object' || ref === null) return false
	if (!('realm' in ref) || typeof ref.realm !== 'string') return false
	return true
}

// --------------------------- Sources -----------------------------

/**
 * Any refs that can be used as sources
 * */
export type AnySourceRef =
	| RamRecorderRef
	| ClipPlayerRef
	| ImageStoreRef
	| SourceBaseRef
	| SourceIntRef
	| SourceIntMVRef
	| SceneRef
	| MatteRef
	| AuxRef
	| FxInputRef
	| AnyInputRef

export function isAnySourceRef(ref: AnyRef): ref is AnySourceRef {
	return (
		ref.realm === 'ramRecorder' ||
		ref.realm === 'clipPlayer' ||
		ref.realm === 'imageStore' ||
		ref.realm === 'source-base' ||
		ref.realm === 'source-int' ||
		ref.realm === 'mv-int' ||
		ref.realm === 'scene' ||
		ref.realm === 'matte' ||
		ref.realm === 'aux' ||
		ref.realm === 'fxInput' ||
		isAnyInputRef(ref)
	)
}

/** Converts a Ref to a Kairos path */
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
			return `RR${ref.playerIndex}`
		case 'clipPlayer':
			return `CP${ref.playerIndex}`
		case 'imageStore':
			return `IS${ref.storeIndex}`
		case 'audio-player':
			return `AP${ref.playerIndex}`
		case 'gfx-channel':
			return `GFX${ref.gfxChannelIndex}`
		case 'gfxScene':
			return ['GFXSCENES', ...ref.scenePath.map(protocolEncodeStr)].join('.')
		case 'gfxScene-item':
			return ['GFXSCENES', ...ref.scenePath.map(protocolEncodeStr), ...ref.sceneItemPath.map(protocolEncodeStr)].join(
				'.'
			)
		case 'audioMixer-channel':
			return ['AUDIOMIXER', ...ref.channelPath.map(protocolEncodeStr)].join('.')
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
		case 'ip-input':
			return `IP${ref.ipInput}`
		case 'sdi-input':
			return `SDI${ref.sdiInput}`
		case 'ndi-input':
			return `NDI${ref.ndiInput}`
		case 'stream-input':
			return `STREAM${ref.streamInput}`
		case 'fxInput':
			return ['FXINPUTS', ...ref.fxInputPath.map(protocolEncodeStr)].join('.')
		case 'matte':
			return ['MATTES', ...ref.mattePath.map(protocolEncodeStr)].join('.')
		case 'ip-input-setting':
			return `IN_IP${ref.ipInputSetting}`
		case 'sdi-input-setting':
			return `IN_SDI${ref.sdiInputSetting}`
		case 'ndi-input-setting':
			return `IN_NDI${ref.ndiInputSetting}`
		case 'stream-input-setting':
			return `IN_STREAM${ref.streamInputSetting}`
		case 'ip-output-setting':
			return `OUT_IP${ref.ipOutputSetting}`
		case 'sdi-output-setting':
			return `OUT_SDI${ref.sdiOutputSetting}`
		case 'ndi-output-setting':
			return `OUT_NDI${ref.ndiOutputSetting}`
		case 'stream-output-setting':
			return `OUT_STREAM${ref.streamOutputSetting}`
		case 'audio-output-setting':
			return `OUT_AUDIO${ref.audioOutputSetting}`
		case 'mv-int':
			return `INTSOURCES.MV${ref.mvId}`
		case 'multi-view':
			return `MV${ref.mvId}`
		case 'multi-view-pip':
			return `MV${ref.mvId}.Windows.PIP-${ref.pipId}`
		case 'multi-view-input':
			return `MV${ref.mvId}.Inputs.${ref.inputId}`
		default:
			assertNever(ref)

			throw new Error(`Unknown ref: ${JSON.stringify(ref)}`)
	}
}
export function pathToRef(ref: string): AnyRef | string {
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
	} else if (path[0].startsWith('RR') && path.length === 1) {
		const index = parseInt(path[0].slice(2), 10)
		if (!Number.isNaN(index) && index > 0) return refRamRecorder(index)
	} else if (path[0].startsWith('CP') && path.length === 1) {
		const index = parseInt(path[0].slice(2), 10)
		if (!Number.isNaN(index) && index > 0) return refClipPlayer(index)
	} else if (path[0].startsWith('IS') && path.length === 1) {
		const index = parseInt(path[0].slice(2), 10)
		if (!Number.isNaN(index) && index > 0) return refImageStore(index)
	} else if (path[0].startsWith('AP') && path.length === 1) {
		const index = parseInt(path[0].slice(2), 10)
		if (!Number.isNaN(index) && index > 0) return refAudioPlayer(index)
	} else if ((path[0] === 'BLACK' || path[0] === 'WHITE') && path.length === 1) {
		return refSourceBase([path[0]])
	} else if (path[0] === 'INTSOURCES') {
		if (path.length === 2) {
			const path1 = path[1] as SourceIntRef['path'][0]
			if (path1 === 'ColorBar' || path1 === 'ColorCircle') {
				return refSourceInt([path1])
			} else if (path[1].startsWith('MV')) {
				const mvId = parseInt(path[1].slice(2), 10)
				if (!Number.isNaN(mvId) && mvId > 0) {
					return refSourceIntMV(mvId)
				}
			} else {
				assertNever(path1)
			}
		}
	} else if (path[0] === 'MATTES') {
		return refMatte(path.slice(1))
	} else if (path[0].startsWith('GFX') && path.length === 1) {
		const index = parseInt(path[0].slice(3), 10)
		if (!Number.isNaN(index) && index > 0) return refGfxChannel(index)
	} else if (path[0] === 'GFXSCENES') {
		return refGfxScene(path.slice(1))
	} else if (path[0] === 'AUX') {
		if (path.length === 2) {
			return refAuxName(path[1])
		}

		if (path.length >= 3 && path[2] === 'Effects') {
			const auxRef = refAuxName(path[1])
			return refAuxEffect(auxRef, path.slice(3))
		}
	} else if (path[0].includes('-AUX')) {
		// Auxes are often refered to without the prefix
		if (path.length === 1) {
			return refAuxId(path[0])
		}
	} else if (path[0].startsWith('IP') && path.length === 1) {
		const index = parseInt(path[0].slice(2), 10)
		if (!Number.isNaN(index) && index > 0) return refIpInput(index)
	} else if (path[0].startsWith('NDI') && path.length === 1) {
		const index = parseInt(path[0].slice(3), 10)
		if (!Number.isNaN(index) && index > 0) return refNDIInput(index)
	} else if (path[0].startsWith('STREAM') && path.length === 1) {
		const index = parseInt(path[0].slice(6), 10)
		if (!Number.isNaN(index) && index > 0) return refStreamInput(index)
	} else if (path[0].startsWith('SDI') && path.length === 1) {
		const index = parseInt(path[0].slice(3), 10)
		if (!Number.isNaN(index) && index > 0) return refSDIInput(index)
	} else if (path[0].startsWith('IN_IP') && path.length === 1) {
		const index = parseInt(path[0].slice(5), 10)
		if (!Number.isNaN(index) && index > 0) return refIpInputSetting(index)
	} else if (path[0].startsWith('IN_SDI') && path.length === 1) {
		const index = parseInt(path[0].slice(6), 10)
		if (!Number.isNaN(index) && index > 0) return refSDIInputSetting(index)
	} else if (path[0].startsWith('IN_NDI') && path.length === 1) {
		const index = parseInt(path[0].slice(6), 10)
		if (!Number.isNaN(index) && index > 0) return refNDIInputSetting(index)
	} else if (path[0].startsWith('IN_STREAM') && path.length === 1) {
		const index = parseInt(path[0].slice(9), 10)
		if (!Number.isNaN(index) && index > 0) return refStreamInputSetting(index)
	} else if (path[0].startsWith('OUT_IP') && path.length === 1) {
		const index = parseInt(path[0].slice(6), 10)
		if (!Number.isNaN(index) && index > 0) return refIpOutputSetting(index)
	} else if (path[0].startsWith('OUT_SDI') && path.length === 1) {
		const index = parseInt(path[0].slice(7), 10)
		if (!Number.isNaN(index) && index > 0) return refSDIOutputSetting(index)
	} else if (path[0].startsWith('OUT_NDI') && path.length === 1) {
		const index = parseInt(path[0].slice(7), 10)
		if (!Number.isNaN(index) && index > 0) return refNDIOutputSetting(index)
	} else if (path[0].startsWith('OUT_STREAM') && path.length === 1) {
		const index = parseInt(path[0].slice(10), 10)
		if (!Number.isNaN(index) && index > 0) return refStreamOutputSetting(index)
	} else if (path[0].startsWith('OUT_AUDIO') && path.length === 1) {
		const index = parseInt(path[0].slice(9), 10)
		if (!Number.isNaN(index) && index > 0) return refAudioOutputSetting(index)
	} else if (path[0].startsWith('MV')) {
		const mvIndex = parseInt(path[0].slice(2), 10)

		if (!Number.isNaN(mvIndex) && mvIndex > 0) {
			if (path.length === 1) {
				return refMultiView(mvIndex)
			} else if (path[1] === 'Windows' && path[2].startsWith('PIP-') && path.length === 3) {
				const pipIndex = parseInt(path[2].slice(4), 10)
				if (!Number.isNaN(mvIndex) && !Number.isNaN(pipIndex) && mvIndex > 0 && pipIndex > 0)
					return refMultiViewPip(refMultiView(mvIndex), pipIndex)
			} else if (path[1] === 'Inputs' && path.length === 3) {
				const inputIndex = parseInt(path[2], 10)
				if (!Number.isNaN(mvIndex) && !Number.isNaN(inputIndex) && mvIndex > 0 && inputIndex > 0)
					return refMultiViewInput(refMultiView(mvIndex), inputIndex)
			}
		}
	} else if (path[0] === 'AUDIOMIXER') {
		return refAudioMixerChannel(path.slice(1)) // Omit 'AUDIOMIXER'
	} else if (path[0] === 'FXINPUTS') {
		return refFxInput(path.slice(1)) // Omit 'FXINPUTS'
	}

	// If nothing else matched, return the original string
	return ref
}

/** Returns an example of a Ref of the given realm */
export function exampleRef(realm: AnyRef['realm']): AnyRef {
	switch (realm) {
		case 'scene':
			return refScene(['Scene1'])
		case 'scene-layer':
			return refSceneLayer(refScene(['Scene1']), ['Layer1'])
		case 'scene-layer-effect':
			return refSceneLayerEffect(refSceneLayer(refScene(['Scene1']), ['Layer1']), ['Effect1'])
		case 'media-clip':
			return refMediaClip(['Clip1'])

		case 'media-still':
			return refMediaStill(['Still1'])
		case 'media-ramrec':
			return refMediaRamRec(['RamRec1'])
		case 'media-image':
			return refMediaImage(['Image1'])
		case 'media-sound':
			return refMediaSound(['Sound1'])
		case 'scene-transition':
			return refSceneTransition(refScene(['Scene1']), ['Transition1'])
		case 'scene-transition-mix':
			return refSceneTransitionMix(refSceneTransition(refScene(['Scene1']), ['Transition1']), ['Mix1'])
		case 'scene-transition-mix-effect':
			return refSceneTransitionMixEffect(
				refSceneTransitionMix(refSceneTransition(refScene(['Scene1']), ['Transition1']), ['Mix1']),
				['Effect1']
			)
		case 'scene-snapshot':
			return refSceneSnapshot(refScene(['Scene1']), ['Snapshot1'])
		case 'macro':
			return refMacro(['Macro1'])
		case 'source-base':
			return refSourceBase(['BLACK'])
		case 'source-int':
			return refSourceInt(['ColorBar'])
		case 'ramRecorder':
			return refRamRecorder(1)
		case 'clipPlayer':
			return refClipPlayer(1)
		case 'imageStore':
			return refImageStore(1)
		case 'audio-player':
			return refAudioPlayer(1)
		case 'gfx-channel':
			return refGfxChannel(1)
		case 'gfxScene':
			return refGfxScene(['GfxScene1'])
		case 'gfxScene-item':
			return refGfxSceneItem(refGfxScene(['GfxScene1']), ['Item1'])
		case 'audioMixer-channel':
			return refAudioMixerChannel(['Channel1'])
		case 'aux':
			return refAuxName('AUX1')
		case 'aux-effect':
			return refAuxEffect(refAuxName('AUX1'), ['Effect1'])
		case 'ip-input':
			return refIpInput(1)
		case 'sdi-input':
			return refSDIInput(1)
		case 'ndi-input':
			return refNDIInput(1)
		case 'stream-input':
			return refStreamInput(1)
		case 'fxInput':
			return refFxInput(['FxInput1'])
		case 'matte':
			return refMatte(['Matte1'])
		case 'ip-input-setting':
			return refIpInputSetting(1)
		case 'sdi-input-setting':
			return refSDIInputSetting(1)
		case 'ndi-input-setting':
			return refNDIInputSetting(1)
		case 'stream-input-setting':
			return refStreamInputSetting(1)
		case 'ip-output-setting':
			return refIpOutputSetting(1)
		case 'sdi-output-setting':
			return refSDIOutputSetting(1)
		case 'ndi-output-setting':
			return refNDIOutputSetting(1)
		case 'stream-output-setting':
			return refStreamOutputSetting(1)
		case 'audio-output-setting':
			return refAudioOutputSetting(1)
		case 'mv-int':
			return refSourceIntMV(1)
		case 'multi-view':
			return refMultiView(1)
		case 'multi-view-pip':
			return refMultiViewPip(refMultiView(1), 1)
		case 'multi-view-input':
			return refMultiViewInput(refMultiView(1), 1)
		default:
			assertNever(realm)

			throw new Error(`Unknown realm: ${JSON.stringify(realm)}`)
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
	playerIndex: number
}
export function refRamRecorder(playerIndex: number): RamRecorderRef {
	return { realm: 'ramRecorder', playerIndex }
}
// ---------------------------- PLAYERS --------------------------------

export type ClipPlayerRef = {
	realm: 'clipPlayer'
	playerIndex: number
}
export function refClipPlayer(playerIndex: number): ClipPlayerRef {
	return { realm: 'clipPlayer', playerIndex }
}
// ---------------------------- IMAGESTORES ----------------------------
export type ImageStoreRef = {
	realm: 'imageStore'
	storeIndex: number
}
export function refImageStore(storeIndex: number): ImageStoreRef {
	return { realm: 'imageStore', storeIndex }
}
// ---------------------------- AUDIOPLAYERS ----------------------------
export type AudioPlayerRef = {
	realm: 'audio-player'
	playerIndex: number
}
export function refAudioPlayer(playerIndex: number): AudioPlayerRef {
	return { realm: 'audio-player', playerIndex }
}

// ---------------------------- GFXCHANNELS ------------------------------
export type GfxChannelRef = {
	realm: 'gfx-channel'
	gfxChannelIndex: number
}
export function refGfxChannel(gfxChannelIndex: number): GfxChannelRef {
	return { realm: 'gfx-channel', gfxChannelIndex }
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
	path: ['ColorBar' | 'ColorCircle']
}
export function refSourceInt(path: SourceIntRef['path']): SourceIntRef {
	return { realm: 'source-int', path }
}

export type SourceIntMVRef = {
	realm: 'mv-int'
	mvId: number
}
export function refSourceIntMV(mvId: number): SourceIntMVRef {
	return { realm: 'mv-int', mvId }
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
export type MatteRef = {
	realm: 'matte'
	mattePath: RefPath
}
export function refMatte(mattePath: MatteRef['mattePath']): MatteRef {
	return { realm: 'matte', mattePath }
}
// ------------------------------- AUX ------------------------------

// Note: we don't specify which type of aux it is, because it looks like there can be
// other aux types that are not documented (like "HDMI-AUX1")

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
// ------------------------------- INPUTS ------------------------------
export type AnyInputRef = IpInputRef | SDIInputRef | NDIInputRef | StreamInputRef
export function isAnyInputRef(ref: AnyRef): ref is AnyInputRef {
	return (
		ref.realm === 'ip-input' || ref.realm === 'sdi-input' || ref.realm === 'ndi-input' || ref.realm === 'stream-input'
	)
}

export type IpInputRef = {
	realm: 'ip-input'
	ipInput: number
}
export type SDIInputRef = {
	realm: 'sdi-input'
	sdiInput: number
}
export type NDIInputRef = {
	realm: 'ndi-input'
	ndiInput: number
}
export type StreamInputRef = {
	realm: 'stream-input'
	streamInput: number
}
export function refIpInput(ipInput: number): IpInputRef {
	return { realm: 'ip-input', ipInput }
}
export function refSDIInput(sdiInput: number): SDIInputRef {
	return { realm: 'sdi-input', sdiInput }
}
export function refNDIInput(ndiInput: number): NDIInputRef {
	return { realm: 'ndi-input', ndiInput }
}
export function refStreamInput(streamInput: number): StreamInputRef {
	return { realm: 'stream-input', streamInput }
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

// ------------------------------- INPUTSETTINGS ----------------------------------

export type IpInputSettingRef = {
	realm: 'ip-input-setting'
	ipInputSetting: number
}
export type SDIInputSettingRef = {
	realm: 'sdi-input-setting'
	sdiInputSetting: number
}
export type NDIInputSettingRef = {
	realm: 'ndi-input-setting'
	ndiInputSetting: number
}
export type StreamInputSettingRef = {
	realm: 'stream-input-setting'
	streamInputSetting: number
}
export function refIpInputSetting(ipInput: number): IpInputSettingRef {
	return { realm: 'ip-input-setting', ipInputSetting: ipInput }
}
export function refSDIInputSetting(sdiInput: number): SDIInputSettingRef {
	return { realm: 'sdi-input-setting', sdiInputSetting: sdiInput }
}
export function refNDIInputSetting(ndiInput: number): NDIInputSettingRef {
	return { realm: 'ndi-input-setting', ndiInputSetting: ndiInput }
}
export function refStreamInputSetting(streamInput: number): StreamInputSettingRef {
	return { realm: 'stream-input-setting', streamInputSetting: streamInput }
}
// ------------------------------- OUTPUTSETTINGS ----------------------------------
export type IpOutputSettingRef = {
	realm: 'ip-output-setting'
	ipOutputSetting: number
}
export type SDIOutputSettingRef = {
	realm: 'sdi-output-setting'
	sdiOutputSetting: number
}
export type NDIOutputSettingRef = {
	realm: 'ndi-output-setting'
	ndiOutputSetting: number
}
export type StreamOutputSettingRef = {
	realm: 'stream-output-setting'
	streamOutputSetting: number
}
export type AudioOutputSettingRef = {
	realm: 'audio-output-setting'
	audioOutputSetting: number
}
export function refIpOutputSetting(ipOutput: number): IpOutputSettingRef {
	return { realm: 'ip-output-setting', ipOutputSetting: ipOutput }
}
export function refSDIOutputSetting(sdiOutput: number): SDIOutputSettingRef {
	return { realm: 'sdi-output-setting', sdiOutputSetting: sdiOutput }
}
export function refNDIOutputSetting(ndiOutput: number): NDIOutputSettingRef {
	return { realm: 'ndi-output-setting', ndiOutputSetting: ndiOutput }
}
export function refStreamOutputSetting(streamOutput: number): StreamOutputSettingRef {
	return { realm: 'stream-output-setting', streamOutputSetting: streamOutput }
}
export function refAudioOutputSetting(audioOutput: number): AudioOutputSettingRef {
	return { realm: 'audio-output-setting', audioOutputSetting: audioOutput }
}

// ------------------------------- MV ----------------------------------
export type MultiViewRef = {
	realm: 'multi-view'
	mvId: number
}
export function refMultiView(mvId: number): MultiViewRef {
	return { realm: 'multi-view', mvId }
}
export type MultiViewPipRef = {
	realm: 'multi-view-pip'
	mvId: number
	pipId: number
}
export function refMultiViewPip(mvRef: MultiViewRef, pipId: number): MultiViewPipRef {
	return { realm: 'multi-view-pip', mvId: mvRef.mvId, pipId }
}
export type MultiViewInputRef = {
	realm: 'multi-view-input'
	mvId: number
	inputId: number
}
export function refMultiViewInput(mvRef: MultiViewRef, inputId: number): MultiViewInputRef {
	return { realm: 'multi-view-input', mvId: mvRef.mvId, inputId }
}
