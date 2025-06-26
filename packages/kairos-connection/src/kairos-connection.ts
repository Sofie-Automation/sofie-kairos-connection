import {
	parseBoolean,
	parseCommaSeparated,
	parseEnum,
	parseInteger,
	parseFloatValue,
	stringifyBoolean,
	stringifyCommaSeparated,
	stringifyEnum,
	stringifyFloat,
	stringifyInteger,
	parsePos3Df,
	stringifyPos3Df,
	parseColorRGB,
	parsePos2D,
	parsePos2Df,
	stringifyColorRGB,
	stringifyPos2D,
	stringifyPos2Df,
	parseSourceRef,
	stringifySourceRef,
	parseSceneTransitionRef,
	stringifySceneTransitionRef,
	parseSourceRefOptional,
} from './lib/data-parsers.js'
import { MinimalKairosConnection } from './minimal/kairos-minimal.js'
import {
	type MediaObject,
	type UpdateSceneObject,
	type SceneObject,
	type ClipPlayerObject,
	type UpdateClipPlayerObject,
	type SceneLayerObject,
	type UpdateSceneLayerObject,
	SceneLayerActiveBus,
	SceneResolution,
	SceneLimitOffAction,
	ClipPlayerTMS,
	SceneLayerPgmPstMode,
	SceneLayerState,
	SceneLayerMode,
	SceneLayerDissolveMode,
	SceneLayerBlendMode,
	SceneLayerEffectCropObject,
	UpdateSceneLayerEffectCropObject,
	SceneLayerEffectTransform2DObject,
	UpdateSceneLayerEffectTransform2DObject,
	SceneLayerEffectTransform2DType,
	SceneLayerEffectLuminanceKeyObject,
	UpdateSceneLayerEffectLuminanceKeyObject,
	SceneLayerEffectLuminanceKeyBlendMode,
	SceneLayerEffectChromaKeyObject,
	UpdateSceneLayerEffectChromaKeyObject,
	SceneLayerEffectChromaKeyEdgeSmoothingSize,
	SceneLayerEffectFilmLookColorMode,
	SceneLayerEffectFilmLookObject,
	SceneLayerEffectGlowEffectObject,
	SceneLayerEffectLinearKeyBlendMode,
	SceneLayerEffectLinearKeyObject,
	SceneLayerEffectLUTCorrectionColorspace,
	SceneLayerEffectLUTCorrectionIndex,
	SceneLayerEffectLUTCorrectionObject,
	SceneLayerEffectLUTCorrectionRange,
	SceneLayerEffectMatrixCorrectionObject,
	SceneLayerEffectPCropObject,
	SceneLayerEffectPositionObject,
	SceneLayerEffectPositionRotate,
	SceneLayerEffectRGBCorrectionObject,
	SceneLayerEffectTemperatureCorrectionObject,
	SceneLayerEffectToneCurveCorrectionObject,
	SceneLayerEffectVirtualPTZObject,
	SceneLayerEffectYUVCorrectionObject,
	UpdateSceneLayerEffectFilmLookObject,
	UpdateSceneLayerEffectGlowEffectObject,
	UpdateSceneLayerEffectLinearKeyObject,
	UpdateSceneLayerEffectLUTCorrectionObject,
	UpdateSceneLayerEffectMatrixCorrectionObject,
	UpdateSceneLayerEffectPCropObject,
	UpdateSceneLayerEffectPositionObject,
	UpdateSceneLayerEffectRGBCorrectionObject,
	UpdateSceneLayerEffectTemperatureCorrectionObject,
	UpdateSceneLayerEffectToneCurveCorrectionObject,
	UpdateSceneLayerEffectVirtualPTZObject,
	UpdateSceneLayerEffectYUVCorrectionObject,
	SceneSnapshotObject,
	SceneSnapshotStatus,
	SceneCurve,
	SceneSnapshotPriorityRecall,
	UpdateSceneSnapshotObject,
	MacroObject,
	MacroStatus,
	UpdateMacroObject,
	SceneTransitionObject,
	UpdateSceneTransitionObject,
	SceneTransitionMixEffectObject,
	UpdateSceneTransitionMixEffectObject,
} from './kairos-types/main.js'
import { ResponseError } from './minimal/errors.js'
import {
	AnyRef,
	isRef,
	MacroRef,
	refToPath,
	SceneLayerEffectRef,
	SceneLayerRef,
	SceneRef,
	SceneSnapshotRef,
	SceneTransitionMixEffectRef,
	SceneTransitionMixRef,
	SceneTransitionRef,
	splitPath,
} from './lib/reference.js'
import { protocolDecodePath, protocolEncodePath, RefPath, RefPathSingle } from './lib/encode-decode.js'

export class KairosConnection extends MinimalKairosConnection {
	// SYS
	// INTSOURCES
	// 	BLACK
	// 	WHITE
	// 	ColorBar
	// 	ColorCircle
	// 	MV<1-4>
	// INPUTSETTINGS
	// 	IPINPUTS
	// 		IN_IP<1-48>
	// 	SDIINPUTS
	// 		IN_SDI<1-32>
	// 	NDIINPUTS
	// 		IN_NDI<1-2>
	// 	STREAMINPUTS
	// 		IN_STREAM<1-6>
	// OUTPUTSETTINGS
	// 	IPOUTS
	// 		OUT_IP<1-32>
	// 	SDIOUTS
	// 		OUT_SDI<1-16>
	// 	NDIOUTS
	// 		OUT_NDI<1-2>
	// 	STREAMOUTS
	// 		OUT_STREAM<1-2>
	// 	AUDIOOUTS
	// 		OUT_AUDIO<1-8>
	// SCENES
	// 	Scene
	async listScenes(
		scenePath: SceneRef = { realm: 'scene', scenePath: [] },
		deep?: boolean
	): Promise<(SceneRef & { name: string })[]> {
		return (await this._listDeep(scenePath, ['Layers', 'Transitions', 'Snapshots'], deep)).map((itemPath) => {
			return {
				realm: 'scene',
				name: itemPath[itemPath.length - 1],
				scenePath: itemPath.slice(1), // remove the "SCENES" part
			}
		})
	}
	async getScene(sceneRef: SceneRef): Promise<SceneObject> {
		const values = await this.getAttributes(refToPath(sceneRef), [
			'advanced_resolution_control',
			'resolution_x',
			'resolution_y',
			'tally',
			'color',
			'resolution',
			'next_transition',
			'all_duration',
			'all_fader',
			'next_transition_type',
			'fader_reverse',
			'fader_sync',
			'limit_off_action',
			'limit_return_time',
			'key_preview',
		])
		return {
			advancedResolutionControl: parseBoolean(values.advanced_resolution_control),
			resolutionX: parseInteger(values.resolution_x),
			resolutionY: parseInteger(values.resolution_y),
			tally: parseInteger(values.tally),
			color: parseColorRGB(values.color),
			resolution: parseEnum<SceneResolution>(values.resolution, SceneResolution),
			nextTransition: parseCommaSeparated(values.next_transition).map((o) => parseSceneTransitionRef(o)),
			allDuration: parseInteger(values.all_duration),
			allFader: parseFloatValue(values.all_fader),
			nextTransitionType: values.next_transition_type,
			faderReverse: parseBoolean(values.fader_reverse),
			faderSync: parseBoolean(values.fader_sync),
			limitOffAction: parseEnum<SceneLimitOffAction>(values.limit_off_action, SceneLimitOffAction),
			limitReturnTime: parseInteger(values.limit_return_time),
			keyPreview: values.key_preview,
		}
	}
	async updateScene(sceneRef: SceneRef, props: Partial<UpdateSceneObject>): Promise<void> {
		await this.setAttributes(refToPath(sceneRef), [
			{ attribute: 'advanced_resolution_control', value: stringifyBoolean(props.advancedResolutionControl) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'resolution', value: stringifyEnum<SceneResolution>(props.resolution, SceneResolution) },
			{
				attribute: 'next_transition',
				value: stringifyCommaSeparated(props.nextTransition?.map((o) => stringifySceneTransitionRef(o))),
			},
			{ attribute: 'all_duration', value: stringifyInteger(props.allDuration) },
			{ attribute: 'all_fader', value: stringifyFloat(props.allFader) },
			{ attribute: 'next_transition_type', value: props.nextTransitionType },
			{ attribute: 'fader_reverse', value: stringifyBoolean(props.faderReverse) },
			{ attribute: 'fader_sync', value: stringifyBoolean(props.faderSync) },
			{ attribute: 'limit_off_action', value: stringifyEnum(props.limitOffAction, SceneLimitOffAction) },
			{ attribute: 'limit_return_time', value: stringifyInteger(props.limitReturnTime) },
			{ attribute: 'key_preview', value: props.keyPreview },
			// resolutionX, resolutionY, tally are read-only
		])
	}
	async sceneAuto(sceneRef: SceneRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneRef)}.auto`)
	}
	async sceneCut(sceneRef: SceneRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneRef)}.cut`)
	}
	async sceneAllSelectedAuto(sceneRef: SceneRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneRef)}.all_selected_auto`)
	}
	async sceneAllSelectedCut(sceneRef: SceneRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneRef)}.all_selected_cut`)
	}
	// omitting "strore_snapshot", it must be a typo, right?
	async sceneStoreSnapshot(sceneRef: SceneRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneRef)}.store_snapshot`)
	}

	// Scene.Layers
	// 		Layers
	// 			Layer

	async listSceneLayers(layerRef: SceneLayerRef, deep?: boolean): Promise<(SceneLayerRef & { name: string })[]> {
		return (await this._listDeep(layerRef, ['Effects'], deep)).map((itemPath) => {
			const paths = splitPath(itemPath, 'Layers')
			if (paths.length !== 2)
				throw new Error(
					`Invalid Layer path: "${JSON.stringify(paths)}" ("Layers" missing) (${JSON.stringify(itemPath)})`
				)

			return {
				realm: 'scene-layer',
				name: paths[1][paths[1].length - 1],
				scenePath: paths[0].slice(1), // remove the "SCENES" part
				layerPath: paths[1],
			}
		})
	}

	async getSceneLayer(layerRef: SceneLayerRef): Promise<SceneLayerObject> {
		const values = await this.getAttributes(refToPath(layerRef), [
			'opacity',
			'sourceA',
			'sourceB',
			'source_pgm',
			'source_pst',
			'active_bus',
			'pgm_pst_mode',
			'sourceOptions',
			'state',
			'mode',
			'fxEnabled',
			'preset_enabled',
			'color',
			'clean_mask',
			'dissolve_enabled',
			'dissolve_time',
			'source_clean_mask',
			'dissolve_mode',
			'blend_mode',
		])

		return {
			opacity: parseFloatValue(values.opacity),
			sourceA: parseSourceRef(values.sourceA),
			sourceB: parseSourceRef(values.sourceB),
			sourcePgm: parseSourceRef(values.source_pgm),
			sourcePst: parseSourceRef(values.source_pst),
			activeBus: parseEnum<SceneLayerActiveBus>(values.active_bus, SceneLayerActiveBus),
			pgmPstMode: parseEnum<SceneLayerPgmPstMode>(values.pgm_pst_mode, SceneLayerPgmPstMode),
			sourceOptions: parseCommaSeparated(values.sourceOptions).map(parseSourceRef),
			state: parseEnum<SceneLayerState>(values.state, SceneLayerState),
			mode: parseEnum<SceneLayerMode>(values.mode, SceneLayerMode),
			fxEnabled: parseBoolean(values.fxEnabled),
			presetEnabled: parseBoolean(values.preset_enabled),
			color: parseColorRGB(values.color),
			cleanMask: parseInteger(values.clean_mask),
			sourceCleanMask: parseInteger(values.source_clean_mask),
			dissolveEnabled: parseBoolean(values.dissolve_enabled),
			dissolveTime: parseInteger(values.dissolve_time),
			dissolveMode: parseEnum<SceneLayerDissolveMode>(values.dissolve_mode, SceneLayerDissolveMode),
			blendMode: parseEnum<SceneLayerBlendMode>(values.blend_mode, SceneLayerBlendMode),
		}
	}

	async updateSceneLayer(layerRef: SceneLayerRef, props: Partial<UpdateSceneLayerObject>): Promise<void> {
		await this.setAttributes(refToPath(layerRef), [
			{ attribute: 'opacity', value: stringifyFloat(props.opacity) },
			{ attribute: 'sourceA', value: stringifySourceRef(props.sourceA) },
			{ attribute: 'source_pgm', value: stringifySourceRef(props.sourcePgm) },
			{ attribute: 'source_pst', value: stringifySourceRef(props.sourcePst) },
			{ attribute: 'pgm_pst_mode', value: stringifyEnum<SceneLayerPgmPstMode>(props.pgmPstMode, SceneLayerPgmPstMode) },
			{
				attribute: 'sourceOptions',
				value: stringifyCommaSeparated(props.sourceOptions?.map((o) => stringifySourceRef(o))),
			},
			{ attribute: 'mode', value: stringifyEnum<SceneLayerMode>(props.mode, SceneLayerMode) },
			{ attribute: 'preset_enabled', value: stringifyBoolean(props.presetEnabled) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'clean_mask', value: stringifyInteger(props.cleanMask) },
			{ attribute: 'source_clean_mask', value: stringifyInteger(props.sourceCleanMask) },
			{ attribute: 'dissolve_enabled', value: stringifyBoolean(props.dissolveEnabled) },
			{ attribute: 'dissolve_time', value: stringifyInteger(props.dissolveTime) },
			{
				attribute: 'dissolve_mode',
				value: stringifyEnum<SceneLayerDissolveMode>(props.dissolveMode, SceneLayerDissolveMode),
			},
			{ attribute: 'blend_mode', value: stringifyEnum<SceneLayerBlendMode>(props.blendMode, SceneLayerBlendMode) },
		])
	}

	async sceneLayerSwapAB(layerRef: SceneLayerRef): Promise<void> {
		return this.executeFunction(`${refToPath(layerRef)}.swap_A_B`)
	}
	async sceneLayerShowLayer(layerRef: SceneLayerRef): Promise<void> {
		return this.executeFunction(`${refToPath(layerRef)}.show_layer`)
	}
	async sceneLayerHideLayer(layerRef: SceneLayerRef): Promise<void> {
		return this.executeFunction(`${refToPath(layerRef)}.hide_layer`)
	}
	async sceneLayerToggleLayer(layerRef: SceneLayerRef): Promise<void> {
		return this.executeFunction(`${refToPath(layerRef)}.toggle_layer`)
	}
	// Scene.Layers.Layer
	// 				Effects
	// 					Crop
	// 					Transform2D
	// 					LuminanceKey
	// 					ChromaKey
	// 					YUVCorrection
	// 					RGBCorrection
	// 					LUTCorrection
	// 					VirtualPTZ
	// 					ToneCurveCorrection
	// 					MatrixCorrection
	// 					TemperatureCorrection
	// 					LinearKey
	// 					Position
	// 					PCrop
	// 					FilmLook
	// 					GlowEffect
	async listSceneLayerEffects(
		layerRef: SceneLayerRef,
		deep?: boolean
	): Promise<(SceneLayerEffectRef & { name: string })[]> {
		return (await this._listDeep(`${refToPath(layerRef)}.Effects`, [], deep)).map((itemPath) => {
			const paths = splitPath(itemPath, 'Layers', 'Effects')
			if (paths.length !== 3)
				throw new Error(
					`Invalid Layer.Effects path: "${JSON.stringify(paths)}" ("Layers" or "Effects" missing) (${JSON.stringify(itemPath)})`
				)

			return {
				realm: 'scene-layer-effect',
				name: paths[2][paths[2].length - 1],
				scenePath: paths[0].slice(1), // remove the "SCENES" part
				layerPath: paths[1],
				effectPath: paths[2],
			}
		})
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectCrop(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectCropObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'top',
			'left',
			'right',
			'bottom',
			'softness',
			'rounded_corners',
			'global_softness',
			'softness_top',
			'softness_left',
			'softness_right',
			'softness_bottom',
		])

		return {
			enabled: parseBoolean(values.enabled),
			top: parseFloatValue(values.top),
			left: parseFloatValue(values.left),
			right: parseFloatValue(values.right),
			bottom: parseFloatValue(values.bottom),
			softness: parseFloatValue(values.softness),
			roundedCorners: parseFloatValue(values.rounded_corners),
			globalSoftness: parseBoolean(values.global_softness),
			softnessTop: parseFloatValue(values.softness_top),
			softnessLeft: parseFloatValue(values.softness_left),
			softnessRight: parseFloatValue(values.softness_right),
			softnessBottom: parseFloatValue(values.softness_bottom),
		}
	}
	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectCrop(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectCropObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'top', value: stringifyFloat(props.top) },
			{ attribute: 'left', value: stringifyFloat(props.left) },
			{ attribute: 'right', value: stringifyFloat(props.right) },
			{ attribute: 'bottom', value: stringifyFloat(props.bottom) },
			{ attribute: 'softness', value: stringifyFloat(props.softness) },
			{ attribute: 'rounded_corners', value: stringifyFloat(props.roundedCorners) },
			{ attribute: 'global_softness', value: stringifyBoolean(props.globalSoftness) },
			// softness_top, softness_left, softness_right, softness_bottom are read-only
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectTransform2D(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectTransform2DObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'type',
			'scale',
			'rotation_x',
			'rotation_y',
			'rotation_z',
			'rotation_origin',
			'position',
			'cubic_interpolation',
			'hide_backside',
			'stretch_h',
			'stretch_v',
		])

		return {
			enabled: parseBoolean(values.enabled),
			type: parseEnum<SceneLayerEffectTransform2DType>(values.type, SceneLayerEffectTransform2DType),
			scale: parseFloatValue(values.scale),
			rotationX: parseFloatValue(values.rotation_x),
			rotationY: parseFloatValue(values.rotation_y),
			rotationZ: parseFloatValue(values.rotation_z),
			rotationOrigin: parsePos3Df(values.rotation_origin),
			position: parsePos3Df(values.position),
			cubicInterpolation: parseBoolean(values.cubic_interpolation),
			hideBackside: parseBoolean(values.hide_backside),
			stretchH: parseFloatValue(values.stretch_h),
			stretchV: parseFloatValue(values.stretch_v),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectTransform2D(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectTransform2DObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{
				attribute: 'type',
				value: stringifyEnum<SceneLayerEffectTransform2DType>(props.type, SceneLayerEffectTransform2DType),
			},
			{ attribute: 'scale', value: stringifyFloat(props.scale) },
			{ attribute: 'rotation_x', value: stringifyFloat(props.rotationX) },
			{ attribute: 'rotation_y', value: stringifyFloat(props.rotationY) },
			{ attribute: 'rotation_z', value: stringifyFloat(props.rotationZ) },
			{ attribute: 'rotation_origin', value: stringifyPos3Df(props.rotationOrigin) },
			{ attribute: 'position', value: stringifyPos3Df(props.position) },
			{ attribute: 'cubic_interpolation', value: stringifyBoolean(props.cubicInterpolation) },
			{ attribute: 'hide_backside', value: stringifyBoolean(props.hideBackside) },
			{ attribute: 'stretch_h', value: stringifyFloat(props.stretchH) },
			{ attribute: 'stretch_v', value: stringifyFloat(props.stretchV) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLuminanceKey(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectLuminanceKeyObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'clip',
			'gain',
			'cleanup',
			'density',
			'invert',
			'blend_mode',
			'sourceKey',
		])

		return {
			enabled: parseBoolean(values.enabled),
			clip: parseFloatValue(values.clip),
			gain: parseFloatValue(values.gain),
			cleanup: parseFloatValue(values.cleanup),
			density: parseFloatValue(values.density),
			invert: parseBoolean(values.invert),
			blendMode: parseEnum<SceneLayerEffectLuminanceKeyBlendMode>(
				values.blend_mode,
				SceneLayerEffectLuminanceKeyBlendMode
			),
			sourceKey: parseSourceRefOptional(values.sourceKey),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLuminanceKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectLuminanceKeyObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'clip', value: stringifyFloat(props.clip) },
			{ attribute: 'gain', value: stringifyFloat(props.gain) },
			{ attribute: 'cleanup', value: stringifyFloat(props.cleanup) },
			{ attribute: 'density', value: stringifyFloat(props.density) },
			{ attribute: 'invert', value: stringifyBoolean(props.invert) },
			{
				attribute: 'blend_mode',
				value: stringifyEnum<SceneLayerEffectLuminanceKeyBlendMode>(
					props.blendMode,
					SceneLayerEffectLuminanceKeyBlendMode
				),
			},
			{ attribute: 'sourceKey', value: stringifySourceRef(props.sourceKey) },
		])
	}
	async sceneLayerEffectLuminanceKeyAutoAdjust(effectRef: SceneLayerEffectRef): Promise<void> {
		return this.executeFunction(`${refToPath(effectRef)}.auto_adjust`)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectChromaKey(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectChromaKeyObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'clip',
			'gain',
			'cleanup',
			'density',
			'hue',
			'selectivity_left',
			'selectivity_right',
			'luminance',
			'chroma',
			'a_chroma',
			'spill_supression',
			'spill_supression_left',
			'spill_supression_right',
			'noise_removal',
			'invert',
			'fgd_fade',
			'auto_state',
			'edge_smoothing_size',
		])

		return {
			enabled: parseBoolean(values.enabled),
			clip: parseFloatValue(values.clip),
			gain: parseFloatValue(values.gain),
			cleanup: parseFloatValue(values.cleanup),
			density: parseFloatValue(values.density),
			hue: parseFloatValue(values.hue),
			selectivityLeft: parseFloatValue(values.selectivity_left),
			selectivityRight: parseFloatValue(values.selectivity_right),
			luminance: parseFloatValue(values.luminance),
			chroma: parseFloatValue(values.chroma),
			aChroma: parseFloatValue(values.a_chroma),
			spillSupression: parseFloatValue(values.spill_supression),
			spillSupressionLeft: parseFloatValue(values.spill_supression_left),
			spillSupressionRight: parseFloatValue(values.spill_supression_right),
			noiseRemoval: parseFloatValue(values.noise_removal),
			invert: parseBoolean(values.invert),
			fgdFade: parseBoolean(values.fgd_fade),
			autoState: parseInteger(values.auto_state),
			edgeSmoothingSize: parseEnum<SceneLayerEffectChromaKeyEdgeSmoothingSize>(
				values.edge_smoothing_size,
				SceneLayerEffectChromaKeyEdgeSmoothingSize
			),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectChromaKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectChromaKeyObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'clip', value: stringifyFloat(props.clip) },
			{ attribute: 'gain', value: stringifyFloat(props.gain) },
			{ attribute: 'cleanup', value: stringifyFloat(props.cleanup) },
			{ attribute: 'density', value: stringifyFloat(props.density) },
			{ attribute: 'hue', value: stringifyFloat(props.hue) },
			{ attribute: 'selectivity_left', value: stringifyFloat(props.selectivityLeft) },
			{ attribute: 'selectivity_right', value: stringifyFloat(props.selectivityRight) },
			{ attribute: 'luminance', value: stringifyFloat(props.luminance) },
			{ attribute: 'chroma', value: stringifyFloat(props.chroma) },
			{ attribute: 'a_chroma', value: stringifyFloat(props.aChroma) },
			{ attribute: 'spill_supression', value: stringifyFloat(props.spillSupression) },
			{ attribute: 'spill_supression_left', value: stringifyFloat(props.spillSupressionLeft) },
			{ attribute: 'spill_supression_right', value: stringifyFloat(props.spillSupressionRight) },
			{ attribute: 'noise_removal', value: stringifyFloat(props.noiseRemoval) },
			{ attribute: 'invert', value: stringifyBoolean(props.invert) },
			{ attribute: 'fgd_fade', value: stringifyBoolean(props.fgdFade) },
			{ attribute: 'auto_state', value: stringifyInteger(props.autoState) },
			{
				attribute: 'edge_smoothing_size',
				value: stringifyEnum<SceneLayerEffectChromaKeyEdgeSmoothingSize>(
					props.edgeSmoothingSize,
					SceneLayerEffectChromaKeyEdgeSmoothingSize
				),
			},
		])
	}
	async sceneLayerEffectChromaKeyAutoAdjust(effectRef: SceneLayerEffectRef): Promise<void> {
		return this.executeFunction(`${refToPath(effectRef)}.auto_adjust`)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectYUVCorrection(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectYUVCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'pedestal',
			'luminance_lift',
			'luminance_gain',
			'luminance_gamma',
			'contrast',
			'saturation',
			'UV_rotation',
			'cyan_red',
			'magenta_green',
			'yellow_blue',
		])

		return {
			enabled: parseBoolean(values.enabled),
			pedestal: parseFloatValue(values.pedestal),
			luminanceLift: parseFloatValue(values.luminance_lift),
			luminanceGain: parseFloatValue(values.luminance_gain),
			luminanceGamma: parseFloatValue(values.luminance_gamma),
			contrast: parseFloatValue(values.contrast),
			saturation: parseFloatValue(values.saturation),
			uvRotation: parseFloatValue(values.UV_rotation),
			cyanRed: parseFloatValue(values.cyan_red),
			magentaGreen: parseFloatValue(values.magenta_green),
			yellowBlue: parseFloatValue(values.yellow_blue),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectYUVCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectYUVCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'pedestal', value: stringifyFloat(props.pedestal) },
			{ attribute: 'luminance_lift', value: stringifyFloat(props.luminanceLift) },
			{ attribute: 'luminance_gain', value: stringifyFloat(props.luminanceGain) },
			{ attribute: 'luminance_gamma', value: stringifyFloat(props.luminanceGamma) },
			{ attribute: 'contrast', value: stringifyFloat(props.contrast) },
			{ attribute: 'saturation', value: stringifyFloat(props.saturation) },
			{ attribute: 'UV_rotation', value: stringifyFloat(props.uvRotation) },
			{ attribute: 'cyan_red', value: stringifyFloat(props.cyanRed) },
			{ attribute: 'magenta_green', value: stringifyFloat(props.magentaGreen) },
			{ attribute: 'yellow_blue', value: stringifyFloat(props.yellowBlue) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectRGBCorrection(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectRGBCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'pedestal_red',
			'pedestal_green',
			'pedestal_blue',
			'lift_red',
			'lift_green',
			'lift_blue',
			'gain_red',
			'gain_green',
			'gain_blue',
			'gamma_red',
			'gamma_green',
			'gamma_blue',
		])

		return {
			enabled: parseBoolean(values.enabled),
			pedestalRed: parseFloatValue(values.pedestal_red),
			pedestalGreen: parseFloatValue(values.pedestal_green),
			pedestalBlue: parseFloatValue(values.pedestal_blue),
			liftRed: parseFloatValue(values.lift_red),
			liftGreen: parseFloatValue(values.lift_green),
			liftBlue: parseFloatValue(values.lift_blue),
			gainRed: parseFloatValue(values.gain_red),
			gainGreen: parseFloatValue(values.gain_green),
			gainBlue: parseFloatValue(values.gain_blue),
			gammaRed: parseFloatValue(values.gamma_red),
			gammaGreen: parseFloatValue(values.gamma_green),
			gammaBlue: parseFloatValue(values.gamma_blue),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectRGBCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectRGBCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'pedestal_red', value: stringifyFloat(props.pedestalRed) },
			{ attribute: 'pedestal_green', value: stringifyFloat(props.pedestalGreen) },
			{ attribute: 'pedestal_blue', value: stringifyFloat(props.pedestalBlue) },
			{ attribute: 'lift_red', value: stringifyFloat(props.liftRed) },
			{ attribute: 'lift_green', value: stringifyFloat(props.liftGreen) },
			{ attribute: 'lift_blue', value: stringifyFloat(props.liftBlue) },
			{ attribute: 'gain_red', value: stringifyFloat(props.gainRed) },
			{ attribute: 'gain_green', value: stringifyFloat(props.gainGreen) },
			{ attribute: 'gain_blue', value: stringifyFloat(props.gainBlue) },
			{ attribute: 'gamma_red', value: stringifyFloat(props.gammaRed) },
			{ attribute: 'gamma_green', value: stringifyFloat(props.gammaGreen) },
			{ attribute: 'gamma_blue', value: stringifyFloat(props.gammaBlue) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLUTCorrection(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectLUTCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'index',
			'input_colorspace',
			'output_colorspace',
			'input_range',
			'output_range',
			'color_space_conversion',
		])

		return {
			enabled: parseBoolean(values.enabled),
			index: parseEnum<SceneLayerEffectLUTCorrectionIndex>(values.index, SceneLayerEffectLUTCorrectionIndex),
			inputColorspace: parseEnum<SceneLayerEffectLUTCorrectionColorspace>(
				values.input_colorspace,
				SceneLayerEffectLUTCorrectionColorspace
			),
			outputColorspace: parseEnum<SceneLayerEffectLUTCorrectionColorspace>(
				values.output_colorspace,
				SceneLayerEffectLUTCorrectionColorspace
			),
			inputRange: parseEnum<SceneLayerEffectLUTCorrectionRange>(values.input_range, SceneLayerEffectLUTCorrectionRange),
			outputRange: parseEnum<SceneLayerEffectLUTCorrectionRange>(
				values.output_range,
				SceneLayerEffectLUTCorrectionRange
			),
			colorSpaceConversion: parseBoolean(values.color_space_conversion),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLUTCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectLUTCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{
				attribute: 'index',
				value: stringifyEnum<SceneLayerEffectLUTCorrectionIndex>(props.index, SceneLayerEffectLUTCorrectionIndex),
			},
			{
				attribute: 'input_colorspace',
				value: stringifyEnum<SceneLayerEffectLUTCorrectionColorspace>(
					props.inputColorspace,
					SceneLayerEffectLUTCorrectionColorspace
				),
			},
			{
				attribute: 'output_colorspace',
				value: stringifyEnum<SceneLayerEffectLUTCorrectionColorspace>(
					props.outputColorspace,
					SceneLayerEffectLUTCorrectionColorspace
				),
			},
			{
				attribute: 'input_range',
				value: stringifyEnum<SceneLayerEffectLUTCorrectionRange>(props.inputRange, SceneLayerEffectLUTCorrectionRange),
			},
			{
				attribute: 'output_range',
				value: stringifyEnum<SceneLayerEffectLUTCorrectionRange>(props.outputRange, SceneLayerEffectLUTCorrectionRange),
			},
			{ attribute: 'color_space_conversion', value: stringifyBoolean(props.colorSpaceConversion) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectVirtualPTZ(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectVirtualPTZObject> {
		const values = await this.getAttributes(refToPath(effectRef), ['enabled', 'position', 'zoom'])

		return {
			enabled: parseBoolean(values.enabled),
			position: parsePos2Df(values.position),
			zoom: parseFloatValue(values.zoom),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectVirtualPTZ(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectVirtualPTZObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'position', value: stringifyPos2Df(props.position) },
			{ attribute: 'zoom', value: stringifyFloat(props.zoom) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectToneCurveCorrection(
		effectRef: SceneLayerEffectRef
	): Promise<SceneLayerEffectToneCurveCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'black_red',
			'black_green',
			'black_blue',
			'gray_low_red',
			'gray_low_green',
			'gray_low_blue',
			'gray_high_red',
			'gray_high_green',
			'gray_high_blue',
			'white_red',
			'white_green',
			'white_blue',
		])

		return {
			enabled: parseBoolean(values.enabled),
			blackRed: parseFloatValue(values.black_red),
			blackGreen: parseFloatValue(values.black_green),
			blackBlue: parseFloatValue(values.black_blue),
			grayLowRed: parseFloatValue(values.gray_low_red),
			grayLowGreen: parseFloatValue(values.gray_low_green),
			grayLowBlue: parseFloatValue(values.gray_low_blue),
			grayHighRed: parseFloatValue(values.gray_high_red),
			grayHighGreen: parseFloatValue(values.gray_high_green),
			grayHighBlue: parseFloatValue(values.gray_high_blue),
			whiteRed: parseFloatValue(values.white_red),
			whiteGreen: parseFloatValue(values.white_green),
			whiteBlue: parseFloatValue(values.white_blue),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectToneCurveCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectToneCurveCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'black_red', value: stringifyFloat(props.blackRed) },
			{ attribute: 'black_green', value: stringifyFloat(props.blackGreen) },
			{ attribute: 'black_blue', value: stringifyFloat(props.blackBlue) },
			{ attribute: 'gray_low_red', value: stringifyFloat(props.grayLowRed) },
			{ attribute: 'gray_low_green', value: stringifyFloat(props.grayLowGreen) },
			{ attribute: 'gray_low_blue', value: stringifyFloat(props.grayLowBlue) },
			{ attribute: 'gray_high_red', value: stringifyFloat(props.grayHighRed) },
			{ attribute: 'gray_high_green', value: stringifyFloat(props.grayHighGreen) },
			{ attribute: 'gray_high_blue', value: stringifyFloat(props.grayHighBlue) },
			{ attribute: 'white_red', value: stringifyFloat(props.whiteRed) },
			{ attribute: 'white_green', value: stringifyFloat(props.whiteGreen) },
			{ attribute: 'white_blue', value: stringifyFloat(props.whiteBlue) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectMatrixCorrection(
		effectRef: SceneLayerEffectRef
	): Promise<SceneLayerEffectMatrixCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'r-g_n',
			'r-g_p',
			'r-b_n',
			'r-b_p',
			'g-r_n',
			'g-r_p',
			'g-b_n',
			'g-b_p',
			'b-r_n',
			'b-r_p',
			'b-g_n',
			'b-g_p',
			'red_phase',
			'red_level',
			'yellow_phase',
			'yellow_level',
			'green_phase',
			'green_level',
			'cyan_phase',
			'cyan_level',
			'blue_phase',
			'blue_level',
			'magenta_phase',
			'magenta_level',
		])

		return {
			enabled: parseBoolean(values.enabled),
			rgN: parseFloatValue(values['r-g_n']),
			rgP: parseFloatValue(values['r-g_p']),
			rbN: parseFloatValue(values['r-b_n']),
			rbP: parseFloatValue(values['r-b_p']),
			grN: parseFloatValue(values['g-r_n']),
			grP: parseFloatValue(values['g-r_p']),
			gbN: parseFloatValue(values['g-b_n']),
			gbP: parseFloatValue(values['g-b_p']),
			brN: parseFloatValue(values['b-r_n']),
			brP: parseFloatValue(values['b-r_p']),
			bgN: parseFloatValue(values['b-g_n']),
			bgP: parseFloatValue(values['b-g_p']),
			redPhase: parseFloatValue(values.red_phase),
			redLevel: parseFloatValue(values.red_level),
			yellowPhase: parseFloatValue(values.yellow_phase),
			yellowLevel: parseFloatValue(values.yellow_level),
			greenPhase: parseFloatValue(values.green_phase),
			greenLevel: parseFloatValue(values.green_level),
			cyanPhase: parseFloatValue(values.cyan_phase),
			cyanLevel: parseFloatValue(values.cyan_level),
			bluePhase: parseFloatValue(values.blue_phase),
			blueLevel: parseFloatValue(values.blue_level),
			magentaPhase: parseFloatValue(values.magenta_phase),
			magentaLevel: parseFloatValue(values.magenta_level),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectMatrixCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectMatrixCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'r-g_n', value: stringifyFloat(props.rgN) },
			{ attribute: 'r-g_p', value: stringifyFloat(props.rgP) },
			{ attribute: 'r-b_n', value: stringifyFloat(props.rbN) },
			{ attribute: 'r-b_p', value: stringifyFloat(props.rbP) },
			{ attribute: 'g-r_n', value: stringifyFloat(props.grN) },
			{ attribute: 'g-r_p', value: stringifyFloat(props.grP) },
			{ attribute: 'g-b_n', value: stringifyFloat(props.gbN) },
			{ attribute: 'g-b_p', value: stringifyFloat(props.gbP) },
			{ attribute: 'b-r_n', value: stringifyFloat(props.brN) },
			{ attribute: 'b-r_p', value: stringifyFloat(props.brP) },
			{ attribute: 'b-g_n', value: stringifyFloat(props.bgN) },
			{ attribute: 'b-g_p', value: stringifyFloat(props.bgP) },
			{ attribute: 'red_phase', value: stringifyFloat(props.redPhase) },
			{ attribute: 'red_level', value: stringifyFloat(props.redLevel) },
			{ attribute: 'yellow_phase', value: stringifyFloat(props.yellowPhase) },
			{ attribute: 'yellow_level', value: stringifyFloat(props.yellowLevel) },
			{ attribute: 'green_phase', value: stringifyFloat(props.greenPhase) },
			{ attribute: 'green_level', value: stringifyFloat(props.greenLevel) },
			{ attribute: 'cyan_phase', value: stringifyFloat(props.cyanPhase) },
			{ attribute: 'cyan_level', value: stringifyFloat(props.cyanLevel) },
			{ attribute: 'blue_phase', value: stringifyFloat(props.bluePhase) },
			{ attribute: 'blue_level', value: stringifyFloat(props.blueLevel) },
			{ attribute: 'magenta_phase', value: stringifyFloat(props.magentaPhase) },
			{ attribute: 'magenta_level', value: stringifyFloat(props.magentaLevel) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectTemperatureCorrection(
		effectRef: SceneLayerEffectRef
	): Promise<SceneLayerEffectTemperatureCorrectionObject> {
		const values = await this.getAttributes(refToPath(effectRef), ['enabled', 'temperature', 'tint', 'keep_luminance'])

		return {
			enabled: parseBoolean(values.enabled),
			temperature: parseInteger(values.temperature),
			tint: parseFloatValue(values.tint),
			keepLuminance: parseBoolean(values.keep_luminance),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectTemperatureCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectTemperatureCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'temperature', value: stringifyInteger(props.temperature) },
			{ attribute: 'tint', value: stringifyFloat(props.tint) },
			{ attribute: 'keep_luminance', value: stringifyBoolean(props.keepLuminance) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLinearKey(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectLinearKeyObject> {
		const values = await this.getAttributes(refToPath(effectRef), ['enabled', 'invert', 'key_source', 'blend_mode'])

		return {
			enabled: parseBoolean(values.enabled),
			invert: parseBoolean(values.invert),
			keySource: parseSourceRefOptional(values.key_source),
			blendMode: parseEnum<SceneLayerEffectLinearKeyBlendMode>(values.blend_mode, SceneLayerEffectLinearKeyBlendMode),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLinearKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectLinearKeyObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'invert', value: stringifyBoolean(props.invert) },
			{ attribute: 'key_source', value: stringifySourceRef(props.keySource) },
			{
				attribute: 'blend_mode',
				value: stringifyEnum<SceneLayerEffectLinearKeyBlendMode>(props.blendMode, SceneLayerEffectLinearKeyBlendMode),
			},
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectPosition(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectPositionObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'enabled',
			'position',
			// 'size',
			'width',
			'height',
			'rotate',
		])

		return {
			enabled: parseBoolean(values.enabled),
			position: parsePos2D(values.position),
			width: parseInteger(values.width),
			// size: parseInteger(values.size), // wierd, we get an Error if we query for the size
			height: parseInteger(values.height),
			rotate: parseEnum<SceneLayerEffectPositionRotate>(values.rotate, SceneLayerEffectPositionRotate),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectPosition(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectPositionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'position', value: stringifyPos2D(props.position) },
			// { attribute: 'size', value: stringifyInteger(props.size) },
			{ attribute: 'width', value: stringifyInteger(props.width) },
			{ attribute: 'height', value: stringifyInteger(props.height) },
			{
				attribute: 'rotate',
				value: stringifyEnum<SceneLayerEffectPositionRotate>(props.rotate, SceneLayerEffectPositionRotate),
			},
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectPCrop(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectPCropObject> {
		const values = await this.getAttributes(refToPath(effectRef), ['enabled', 'left', 'right', 'top', 'bottom'])

		return {
			enabled: parseBoolean(values.enabled),
			left: parseInteger(values.left),
			right: parseInteger(values.right),
			top: parseInteger(values.top),
			bottom: parseInteger(values.bottom),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectPCrop(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectPCropObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'left', value: stringifyInteger(props.left) },
			{ attribute: 'right', value: stringifyInteger(props.right) },
			{ attribute: 'top', value: stringifyInteger(props.top) },
			{ attribute: 'bottom', value: stringifyInteger(props.bottom) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectFilmLook(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectFilmLookObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			'crack',
			'spots',
			'grain',
			'shake',
			'shadow',
			'color mode',
			'color strength',
		])

		return {
			crack: parseFloatValue(values.crack),
			spots: parseFloatValue(values.spots),
			grain: parseFloatValue(values.grain),
			shake: parseFloatValue(values.shake),
			shadow: parseFloatValue(values.shadow),
			colorMode: parseEnum<SceneLayerEffectFilmLookColorMode>(values['color mode'], SceneLayerEffectFilmLookColorMode),
			colorStrength: parseFloatValue(values['color strength']),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectFilmLook(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectFilmLookObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'crack', value: stringifyFloat(props.crack) },
			{ attribute: 'spots', value: stringifyFloat(props.spots) },
			{ attribute: 'grain', value: stringifyFloat(props.grain) },
			{ attribute: 'shake', value: stringifyFloat(props.shake) },
			{ attribute: 'shadow', value: stringifyFloat(props.shadow) },
			{
				attribute: 'color mode',
				value: stringifyEnum<SceneLayerEffectFilmLookColorMode>(props.colorMode, SceneLayerEffectFilmLookColorMode),
			},
			{ attribute: 'color strength', value: stringifyFloat(props.colorStrength) },
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectGlowEffect(effectRef: SceneLayerEffectRef): Promise<SceneLayerEffectGlowEffectObject> {
		const values = await this.getAttributes(refToPath(effectRef), [
			// 'enabled',
			'clip',
			'gain',
			'softness',
			'glow color',
		])

		return {
			// enabled: parseBoolean(values.enabled),
			clip: parseFloatValue(values.clip),
			gain: parseFloatValue(values.gain),
			softness: parseFloatValue(values.softness),
			glowColor: parseColorRGB(values['glow color']),
		}
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectGlowEffect(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateSceneLayerEffectGlowEffectObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			// { attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'clip', value: stringifyFloat(props.clip) },
			{ attribute: 'gain', value: stringifyFloat(props.gain) },
			{ attribute: 'softness', value: stringifyFloat(props.softness) },
			{ attribute: 'glow color', value: stringifyColorRGB(props.glowColor) },
		])
	}

	// Scene.Layers.Layer
	//             Transitions
	//                 Transition
	//                 BgdMix
	//                     TransitionEffect

	async listSceneTransitions(sceneRef: SceneRef): Promise<SceneTransition[]> {
		// List base Transitions:
		return await Promise.all(
			(await this.getList(`${refToPath(sceneRef)}.Transitions`)).map(async (rawTransitionPath) => {
				// "SCENES.Main.Transitions.L1"
				const decodedTransitionPath = protocolDecodePath(rawTransitionPath) // decode the path

				const paths = splitPath(decodedTransitionPath, 'Transitions')
				if (paths.length !== 2)
					throw new Error(
						`Invalid Transitions path: "${JSON.stringify(paths)}" ("Transitions" missing) (${JSON.stringify(rawTransitionPath)})`
					)
				const scenePath = paths[0].slice(1) // remove the "SCENES" part
				const path1 = paths[1]
				if (path1.length !== 1)
					throw new Error(
						`Invalid Transitions path: "${JSON.stringify(paths)}" (expected a single Transition name) (${JSON.stringify(rawTransitionPath)})`
					)
				const transitionPath: RefPathSingle = [path1[0]]
				return {
					realm: 'scene-transition',
					scenePath,
					transitionPath,
					name: paths[1][paths[1].length - 1],
					mixes: await Promise.all(
						(await this.getList(rawTransitionPath)).map(async (rawTransitionMixPath) => {
							// "SCENES.Main.Transitions.L1.L1"
							const decodedTransitionMixPath = protocolDecodePath(rawTransitionMixPath) // decode the path

							const mixPathRest = decodedTransitionMixPath.slice(decodedTransitionPath.length) // remove the "SCENES.Transitions.L1" part
							if (mixPathRest.length !== 1)
								throw new Error(
									`Invalid Transitions.Mix path: "${JSON.stringify(paths)}" (${JSON.stringify(rawTransitionMixPath)})`
								)

							const mixPath: RefPathSingle = [mixPathRest[0]]

							return {
								realm: 'scene-transition-mix',
								scenePath,
								transitionPath,
								mixPath,
								name: mixPath[mixPath.length - 1],
								effects: await Promise.all(
									(await this.getList(rawTransitionMixPath)).map(async (rawTransitionMixEffectPath) => {
										// "SCENES.Main.Transitions.L1.L1.Effect-1"
										const decodedTransitionMixEffectPath = protocolDecodePath(rawTransitionMixEffectPath) // decode the path

										const effectPathRest = decodedTransitionMixEffectPath.slice(decodedTransitionMixPath.length) // remove the "SCENES.Transitions.L1" part
										if (effectPathRest.length !== 1)
											throw new Error(
												`Invalid Transitions.Mix.Effect path: "${JSON.stringify(paths)}" (${JSON.stringify(rawTransitionMixEffectPath)})`
											)

										const effectPath: RefPathSingle = [effectPathRest[0]]

										return {
											realm: 'scene-transition-mix-effect',
											scenePath,
											transitionPath,
											mixPath,
											effectPath,
											name: effectPath[effectPath.length - 1],
										} satisfies SceneTransitionMixEffect
									})
								),
							} satisfies SceneTransitionMix
						})
					),
				} satisfies SceneTransition
			})
		)
	}
	async getSceneTransition(sceneTransitionRef: SceneTransitionRef): Promise<SceneTransitionObject> {
		const values = await this.getAttributes(refToPath(sceneTransitionRef), [
			'progress',
			'progressFrames', // note: _not_ snake_case in docs!
			'duration',
		])

		return {
			progress: parseFloatValue(values.progress),
			progressFrames: parseInteger(values.progressFrames),
			duration: parseInteger(values.duration),
		}
	}
	async updateSceneTransition(
		sceneTransitionRef: SceneTransitionRef,
		props: Partial<UpdateSceneTransitionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(sceneTransitionRef), [
			{ attribute: 'duration', value: stringifyInteger(props.duration) },
			// progress, progressFrames are read-only
		])
	}
	async sceneTransitionTransitionCut(sceneTransitionRef: SceneTransitionRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneTransitionRef)}.transition_cut`)
	}
	async sceneTransitionTransitionAuto(sceneTransitionRef: SceneTransitionRef): Promise<void> {
		return this.executeFunction(`${refToPath(sceneTransitionRef)}.transition_auto`)
	}

	async getSceneTransitionMixEffect(
		sceneTransitionMixEffectRef: SceneTransitionMixEffectRef
	): Promise<SceneTransitionMixEffectObject> {
		const values = await this.getAttributes(refToPath(sceneTransitionMixEffectRef), ['curve', 'effect', 'effect_name'])

		return {
			curve: parseEnum<SceneCurve>(values.curve, SceneCurve),
			effect: values.effect,
			effectName: values.effect_name,
		}
	}
	async updateSceneTransitionMixEffect(
		sceneTransitionMixEffectRef: SceneTransitionMixEffectRef,
		props: Partial<UpdateSceneTransitionMixEffectObject>
	): Promise<void> {
		await this.setAttributes(refToPath(sceneTransitionMixEffectRef), [
			{ attribute: 'curve', value: stringifyEnum<SceneCurve>(props.curve, SceneCurve) },
			// effect, effect_name are read-only
		])
	}

	// Scene.Layers.Layer
	//             Snapshots
	//                 SNP

	async listSceneSnapshots(sceneRef: SceneRef): Promise<(SceneSnapshotRef & { name: string })[]> {
		return (await this._listDeep(`${refToPath(sceneRef)}.Snapshots`, [], false)).map((itemPath) => {
			const paths = splitPath(itemPath, 'Snapshots')
			if (paths.length !== 2)
				throw new Error(
					`Invalid Snapshot path: "${JSON.stringify(paths)}" ("Snapshots" missing) (${JSON.stringify(itemPath)})`
				)

			return {
				realm: 'scene-snapshot',
				name: paths[1][paths[1].length - 1],
				scenePath: paths[0].slice(1), // remove the "SCENES" part
				snapshotPath: paths[1],
			}
		})
	}
	async getSceneSnapshot(snapshotRef: SceneSnapshotRef): Promise<SceneSnapshotObject> {
		const values = await this.getAttributes(refToPath(snapshotRef), [
			'status',
			'color',
			'dissolve_time',
			'enable_curve',
			'curve',
			'priority_recall',
		])

		return {
			status: parseEnum<SceneSnapshotStatus>(values.status, SceneSnapshotStatus),
			color: parseColorRGB(values.color),
			dissolveTime: parseInteger(values.dissolve_time),
			enableCurve: parseBoolean(values.enable_curve),
			curve: parseEnum<SceneCurve>(values.curve, SceneCurve),
			priorityRecall: parseEnum<SceneSnapshotPriorityRecall>(values.priority_recall, SceneSnapshotPriorityRecall),
		}
	}

	async updateSceneSnapshot(snapshotRef: SceneSnapshotRef, props: Partial<UpdateSceneSnapshotObject>): Promise<void> {
		await this.setAttributes(refToPath(snapshotRef), [
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'dissolve_time', value: stringifyInteger(props.dissolveTime) },
			{ attribute: 'enable_curve', value: stringifyBoolean(props.enableCurve) },
			{ attribute: 'curve', value: stringifyEnum<SceneCurve>(props.curve, SceneCurve) },
			{
				attribute: 'priority_recall',
				value: stringifyEnum<SceneSnapshotPriorityRecall>(props.priorityRecall, SceneSnapshotPriorityRecall),
			},
			// status is read only
		])
	}
	async sceneSnapshotRecall(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.recall`)
	}
	async sceneSnapshotForceDissolve(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.force_dissolve`)
	}
	async sceneSnapshotForceRecall(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.force_recall`)
	}
	async sceneSnapshotUpdate(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.update`)
	}
	async sceneSnapshotAbort(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.abort`)
	}
	async sceneSnapshotDeleteEx(snapshotRef: SceneSnapshotRef): Promise<void> {
		return this.executeFunction(`${refToPath(snapshotRef)}.delete_ex`)
	} // SOURCES
	// 	FXINPUTS
	// 		Fx
	// 			SourceEffectGroup
	// 				Crop
	// 				Transform2D
	// 				YUVCorrection
	// 				RGBCorrection
	// 				LUTCorrection
	// 				LuminanceKey
	// 				ChromaKey
	// 				VirtualPTZ
	// 				LinearKey
	// 				ToneCurveCorrection
	// 				MatrixCorrection
	// 				TemperatureCorrection
	// 				Position
	// 				PCrop
	// 				FilmLook
	// 				GlowEffect
	// 	MATTES
	// 		ColorMatte
	// 		TestPattern
	// 		Shaped
	// 		Rays
	// 		Starfield

	// RAMRECORDERS
	// 	RR<1-8>
	async getRamRecorder(ramRecorderId: number): Promise<ClipPlayerObject> {
		this._assertRamRecorderIdIsValid(ramRecorderId)

		const values = await this.getAttributes(`RR${ramRecorderId}`, [
			'color_overwrite',
			'color',
			'timecode',
			'remaining_time',
			'position',
			'repeat',
			'tms',
			'clip',
			'tally',
			'autoplay',
		])
		return {
			colorOverwrite: parseBoolean(values.color_overwrite),
			color: parseColorRGB(values.color),
			timecode: values.timecode,
			remainingTime: values.remaining_time,
			position: parseInteger(values.position),
			repeat: parseBoolean(values.repeat),
			tms: parseEnum(values.tms, ClipPlayerTMS),
			clip: values.clip,
			tally: parseInteger(values.tally),
			autoplay: parseBoolean(values.autoplay),
		}
	}
	async updateRamRecorder(ramRecorderId: number, props: Partial<UpdateClipPlayerObject>): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		await this.setAttributes(`RR${ramRecorderId}`, [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'clip', value: props.clip }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInteger(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyEnum<ClipPlayerTMS>(props.tms, ClipPlayerTMS) },
			{ attribute: 'autoplay', value: stringifyBoolean(props.autoplay) },
			// 'tally' is read-only, so can't be set
		])
	}
	async ramRecorderBegin(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.begin`)
	}
	async ramRecorderRewind(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.rewind`)
	}
	async ramRecorderStepBack(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.step_back`)
	}
	async ramRecorderReverse(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.reverse`)
	}
	async ramRecorderPlay(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.play`)
	}
	async ramRecorderPlayLoop(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.play_loop`)
	}
	async ramRecorderPause(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.pause`)
	}
	async ramRecorderStop(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.stop`)
	}
	async ramRecorderStepForward(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.step_forward`)
	}
	async ramRecorderFastForward(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.fast_forward`)
	}
	async ramRecorderEnd(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.end`)
	}
	async ramRecorderPlaylistBegin(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.playlist_begin`)
	}
	async ramRecorderPlaylistBack(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.playlist_back`)
	}
	async ramRecorderPlaylistNext(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.playlist_next`)
	}
	async ramRecorderPlaylistEnd(ramRecorderId: number): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		return this.executeFunction(`RR${ramRecorderId}.playlist_end`)
	}

	private _assertRamRecorderIdIsValid(playerId: number): void {
		if (typeof playerId !== 'number' || playerId < 1 || playerId > 8) {
			throw new Error(`Invalid playerId: ${playerId}. Must be between 1 and 8.`)
		}
	}

	// PLAYERS
	// 	CP<1-2>
	async getClipPlayer(playerId: number): Promise<ClipPlayerObject> {
		this._assertPlayerIdIsValid(playerId)

		const values = await this.getAttributes(`CP${playerId}`, [
			'color_overwrite',
			'color',
			'timecode',
			'remaining_time',
			'position',
			'repeat',
			'tms',
			'clip',
			'tally',
			'autoplay',
		])
		return {
			colorOverwrite: parseBoolean(values.color_overwrite),
			color: parseColorRGB(values.color),
			timecode: values.timecode,
			remainingTime: values.remaining_time,
			position: parseInteger(values.position),
			repeat: parseBoolean(values.repeat),
			tms: parseEnum<ClipPlayerTMS>(values.tms, ClipPlayerTMS),
			clip: values.clip,
			tally: parseInteger(values.tally),
			autoplay: parseBoolean(values.autoplay),
		}
	}
	async updateClipPlayer(playerId: number, props: Partial<UpdateClipPlayerObject>): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		await this.setAttributes(`CP${playerId}`, [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'clip', value: props.clip }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInteger(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyEnum<ClipPlayerTMS>(props.tms, ClipPlayerTMS) },
			{ attribute: 'autoplay', value: stringifyBoolean(props.autoplay) },
			// 'tally' is read-only, so can't be set
		])
	}
	async clipPlayerBegin(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.begin`)
	}
	async clipPlayerRewind(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.rewind`)
	}
	async clipPlayerStepBack(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.step_back`)
	}
	async clipPlayerReverse(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.reverse`)
	}
	async clipPlayerPlay(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.play`)
	}
	async clipPlayerPause(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.pause`)
	}
	async clipPlayerStop(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.stop`)
	}
	async clipPlayerStepForward(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.step_forward`)
	}
	async clipPlayerFastForward(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.fast_forward`)
	}
	async clipPlayerEnd(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.end`)
	}
	async clipPlayerPlaylistBegin(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.playlist_begin`)
	}
	async clipPlayerPlaylistBack(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.playlist_back`)
	}
	async clipPlayerPlaylistNext(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.playlist_next`)
	}
	async clipPlayerPlaylistEnd(playerId: number): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		return this.executeFunction(`CP${playerId}.playlist_end`)
	}

	private _assertPlayerIdIsValid(playerId: number): void {
		if (typeof playerId !== 'number' || playerId < 1 || playerId > 2) {
			throw new Error(`Invalid playerId: ${playerId}. Must be 1 or 2.`)
		}
	}

	// MEDIA
	// 	clips
	// 		file_name.mov
	// 	stills
	// 		file_name.rr
	// 	ramrec
	// 		file_name.rr
	// 	images
	// 		file_name.png
	// 	sounds
	// 		file_name.wav

	async listMediaClips(): Promise<string[]> {
		// TODO: deep search
		return this.getList('MEDIA.clips')
	}
	async getMediaClip(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.clips`, name)
	}
	async listMediaStills(): Promise<string[]> {
		// TODO: deep search
		return this.getList('MEDIA.stills')
	}
	async getMediaStill(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.stills`, name)
	}
	async listMediaRamRec(): Promise<string[]> {
		// TODO: deep search
		return this.getList('MEDIA.ramrec')
	}
	async getMediaRamRec(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.ramrec`, name)
	}
	async listMediaImage(): Promise<string[]> {
		// TODO: deep search
		return this.getList('MEDIA.images')
	}
	async getMediaImage(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.images`, name)
	}
	async listMediaSounds(): Promise<string[]> {
		// TODO: deep search
		return this.getList('MEDIA.sounds')
	}
	async getMediaSound(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.sounds`, name)
	}

	private async _getMediaObject(basePath: string, mediaName: string): Promise<MediaObject | undefined> {
		try {
			const values = await this.getAttributes(`${basePath}.${mediaName}`, ['name', 'status', 'load_progress'])
			return {
				name: values.name,
				status: parseInteger(values.status),
				loadProgress: parseFloatValue(values.load_progress),
			}
		} catch (error) {
			if (error instanceof ResponseError) {
				// Check if the clip exists, or there actually was an error:
				const objectList = await this.getList(basePath)
				if (!objectList.includes(mediaName)) {
					// The object does not exist, so we return undefined
					return undefined
				}
			}
			throw error
		}
	}

	// TRANSLIB
	// 	TRANSFX
	// 		MIX_FX
	// 			Mix
	// 			MixViaBlack
	// 			MixViaWhite
	// 			NonAdditiveMix
	// 		WIPE_FX
	// 			WipeLeft
	// 			WipeRight
	// 			WipeTop
	// 			WipeBottom
	// 			WipeBoxTopLeft
	// 			WipeBoxTopRight
	// 			WipeBoxBottomRight
	// 			WipeBoxBottomLeft
	// 			WipeBoxTopCenter
	// 			WipeBoxRightCenter
	// 			WipeBoxBottomCenter
	// 			WipeBoxLeftCenter
	// 			WipeFourBoxCornersIn
	// 			WipeFourBoxCornersOut
	// 			WipeDiagonalTopLeft
	// 			WipeDiagonalTopRight
	// 			WipeBarnDoorVertical
	// 			WipeBarnDoorHorizontal
	// 			WipeBarnDoorDiagonalBottomLeft
	// 			WipeBarnDoorDiagonalTopLeft
	// 			WipeCircle
	// 			WipeStar4
	// 			WipeStar5
	// 			WipeStar6
	// 			WipeClockClockwiseTwelve
	// 			WipePinWheelTwoBladeVertical
	// 			WipePinWheelTwoBladeHorizontal
	// 			WipePinWheelFourBlade
	// 			WipeSingleSweepClockwiseTop
	// 			WipeSingleSweepClockwiseRight
	// 			WipeSingleSweepClockwiseBottom
	// 			WipeSingleSweepClockwiseLeft
	// 			WipeSingleSweepClockwiseTopLeft
	// 			WipeSingleSweepCounterClockwiseBottomLeft
	// 			WipeSingleSweepClockwiseBottomRight
	// 			WipeSingleSweepCounterClockwiseTopRight
	// 			WipeFanCenterTop
	// 			WipeFanCenterRight
	// 			WipeFanTop
	// 			WipeFanRight
	// 			WipeFanBottom
	// 			WipeFanLeft
	// 			WipeDoubleFanOutVertical
	// 			WipeDoubleFanOutHorizontal
	// 			WipeDoubleFanInVertical
	// 			WipeDoubleFanInHorizontal
	// 			WipeDoubleSweepParallelVertical
	// 			WipeDoubleSweepParallelDiagonal
	// 			WipeDoubleSweepOppositeVertical
	// 			WipeDoubleSweepOppositeHorizontal
	// 			WipeDoubleSweepParallelDiagonalTopLeft
	// 			WipeDoubleSweepParallelDiagonalBottomLeft
	// 			WipeSaloonDoorTop
	// 			WipeSaloonDoorLeft
	// 			WipeSaloonDoorBottom
	// 			WipeSaloonDoorRight
	// 			WipeWindshieldRight
	// 			WipeSnakeTopLeftHorizontal
	// 			WipeSpiralTopLeftClockwise
	// 		DVE_FX
	// 			Scale
	// 			PushLeft
	// 			PushRight
	// 			PushUp
	// 			PushDown
	// 			RotateTL
	// 			RotateBL
	// 			RotateTR
	// 			RotateBR
	// 			RotateTLRev
	// 			RotateBLRev
	// 			RotateTRRev
	// 			RotateBRRev
	// 			SqueezeLeft
	// 			SqueezeRight
	// 			SqueezeTop
	// 			SqueezeBottom
	// 			SqueezeVCenter
	// 			SqueezeHCenter
	// 			Zoom
	// 		USER_FX
	// 			MoveLinear
	// 			ReplayWipe
	// 			ReplayWipeMask
	// 			MixAdvanced
	// 			UserWipe
	// 			Ripple
	// 			Burst
	// MV<1-4>
	// 	Windows
	// 		PIP-<1-36>
	// 	Inputs
	// 		<1-36>
	// MACROS
	// 	Macro
	async listMacros(
		macroRef: MacroRef = { realm: 'macro', macroPath: [] },
		deep?: boolean
	): Promise<(MacroRef & { name: string })[]> {
		return (await this._listDeep(macroRef, ['status'], deep)).map((itemPath) => {
			return {
				realm: 'macro',
				name: itemPath[itemPath.length - 1],
				macroPath: itemPath.slice(1), // remove the "MACROS" part
			}
		})
	}
	async getMacro(macroRef: MacroRef): Promise<MacroObject> {
		const values = await this.getAttributes(refToPath(macroRef), ['status', 'color'])

		return {
			status: parseEnum<MacroStatus>(values.status, MacroStatus),
			color: parseColorRGB(values.color),
		}
	}

	async updateMacro(macroRef: MacroRef, props: Partial<UpdateMacroObject>): Promise<void> {
		await this.setAttributes(refToPath(macroRef), [
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			// status is read only
		])
	}
	async macroRecall(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.recall`)
	}

	async macroPlay(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.play`)
	}
	async macroContinue(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.continue`)
	}
	async macroRecord(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.record`)
	}
	async macroStopRecord(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.stop_record`)
	}
	async macroPause(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.pause`)
	}
	async macroStop(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.stop`)
	}
	async macroDeleteEx(macroRef: MacroRef): Promise<void> {
		return this.executeFunction(`${refToPath(macroRef)}.delete_ex`)
	}
	// AUX
	// 	NDI-AUX<1-2>
	// 		Effects
	// 			YUVCorrection
	// 			RGBCorrection
	// 			LUTCorrection
	// 			Crop
	// 			MatrixCorrection
	// 			ToneCurveCorrection
	// 			TemperatureCorrection
	// 			FilmLook
	// 			GlowEffect
	// 	STREAM-AUX<1-2>
	// 		Effects
	// 			YUVCorrection
	// 			RGBCorrection
	// 			LUTCorrection
	// 			Crop
	// 			MatrixCorrection
	// 			ToneCurveCorrection
	// 			TemperatureCorrection
	// 			FilmLook
	// 			GlowEffect
	// 	IP-AUX<1-32>
	// 		Effects
	// 			YUVCorrection
	// 			RGBCorrection
	// 			LUTCorrection
	// 			Crop
	// 			MatrixCorrection
	// 			ToneCurveCorrection
	// 			TemperatureCorrection
	// 			FilmLook
	// 			GlowEffect
	// 	SDI-AUX<1-16>
	// 		Effects
	// 			YUVCorrection
	// 			RGBCorrection
	// 			LUTCorrection
	// 			Crop
	// 			MatrixCorrection
	// 			ToneCurveCorrection
	// 			TemperatureCorrection
	// 			FilmLook
	// 			GlowEffect
	// 	AUDIO-AUX<1-8>
	// INPUTS
	// 	IP<1-48>
	// 	NDI<1-2>
	// 	STREAM<1-6>
	// 	SDI<1-32>
	// TRIGGERS
	// 	HTTP Trigger
	// 	IP Trigger
	// 	GPO Command
	// MVPRESETS
	// 	<1-12>
	// 		Inputs
	// 			<1-36>
	// GFXCHANNELS
	// 	GFX<1-2>
	// GFXSCENES
	// 	GfxScene
	// 		Text
	// 		TextBox
	// 		Counter
	// 		Clock
	// PANELPROFILES
	// AUDIOGENERATORS
	// 	GEN<1-2>
	// AUDIOPLAYERS
	// 	AP<1-4>
	// AUDIOMIXERS
	// 	AUDIOMIXER
	// 		Channel <1-16>
	// 	AUDIOMONITOR
	// 	MIXOUT<1-8>
	// AUDIOOUTPUTS
	// CPANELPROFILES
	// ParameterCouples
	// 	Couple
	// PANELLAYOUTS
	// CPANELLAYOUTS
	// IMAGESTORES
	// 	IS<1-8>
	// SPANELPROFILES

	/**
	 * Convenience method for listing items in a deep list
	 * @param baseRef Path to the base item to list from
	 * @param excludeFilter Either a list of names that are known properties (and should be excluded), or a filter function.
	 *   This is used to NOT traverse into the tree of properties
	 * @param deep Whether to traverse into subfolders
	 * @returns A list of items
	 */
	private async _listDeep(
		baseRef: AnyRef | RefPath | string,
		excludeFilter: string[] | ((ref: RefPath, path: string) => boolean) = [],
		deep?: boolean
	): Promise<RefPath[]> {
		const basePath: string =
			typeof baseRef === 'string' ? baseRef : isRef(baseRef) ? refToPath(baseRef) : protocolEncodePath(baseRef)

		const list = (await this.getList(basePath))
			.map((itemPath) => protocolDecodePath(itemPath)) // decode the path
			.filter((itemPath) => {
				// Prune things from the list that are properties, not listable items:

				if (typeof excludeFilter === 'function') {
					return excludeFilter(itemPath, protocolEncodePath(itemPath)) // use the function to determine if the item is listable
				} else {
					const last = itemPath[itemPath.length - 1]
					if (excludeFilter.includes(last)) return false // known properties are not listable items
					return true
				}
			})

		if (deep) {
			// Also include subfolders:
			for (const itemRef of list) {
				try {
					const innerList = await this._listDeep(itemRef, excludeFilter, true)

					for (const innerItemRef of innerList) {
						list.push(innerItemRef)
					}
				} catch (e) {
					if (e instanceof ResponseError) continue // ignore response error, this just means that the item is not a folder
					throw e
				}
			}
		}

		return list
	}
}

// ------------------------ Custom types -------------------------
export type SceneTransition = SceneTransitionRef & { name: string; mixes: SceneTransitionMix[] }
export type SceneTransitionMix = SceneTransitionMixRef & { name: string; effects: SceneTransitionMixEffect[] }
export type SceneTransitionMixEffect = SceneTransitionMixEffectRef & { name: string }
