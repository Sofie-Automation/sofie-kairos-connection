import {
	stringifyBoolean,
	stringifyCommaSeparated,
	stringifyEnum,
	stringifyFloat,
	stringifyInteger,
	stringifyPos3Df,
	stringifyColorRGB,
	stringifyPos2D,
	stringifyPos2Df,
	stringifySourceRef,
	stringifySceneTransitionRef,
	stringifyGfxSceneRef,
} from './lib/data-parsers.js'
import { MinimalKairosConnection, SubscriptionCallback } from './minimal/kairos-minimal.js'
import {
	type MediaObject,
	type UpdateSceneObject,
	type SceneObject,
	type ClipPlayerObject,
	type UpdateClipPlayerObject,
	type SceneLayerObject,
	type UpdateSceneLayerObject,
	SceneResolution,
	SceneLimitOffAction,
	ClipPlayerTMS,
	SceneLayerPgmPstMode,
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
	SceneCurve,
	SceneSnapshotPriorityRecall,
	UpdateSceneSnapshotObject,
	MacroObject,
	UpdateMacroObject,
	SceneTransitionObject,
	UpdateSceneTransitionObject,
	SceneTransitionMixEffectObject,
	UpdateSceneTransitionMixEffectObject,
	GfxChannelObject,
	UpdateGfxChannelObject,
	GfxSceneObject,
	GfxSceneItemObject,
	UpdateGfxSceneItemObject,
	UpdateGfxSceneHTMLElementItemObject,
	GfxSceneHTMLElementItemObject,
	UpdateGfxSceneObject,
} from './kairos-types/main.js'
import { ResponseError, TerminateSubscriptionError } from './minimal/errors.js'
import {
	AnyRef,
	GfxSceneItemRef,
	GfxSceneRef,
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
import {
	getProtocolAttributeNames,
	ObjectEncodingDefinition,
	ObjectValueEncodingDefinition,
	SceneObjectEncodingDefinition,
	SceneLayerObjectEncodingDefinition,
	SceneLayerEffectCropObjectEncodingDefinition,
	SceneLayerEffectTransform2DObjectEncodingDefinition,
	SceneLayerEffectLuminanceKeyObjectEncodingDefinition,
	SceneLayerEffectChromaKeyObjectEncodingDefinition,
	SceneLayerEffectYUVCorrectionObjectEncodingDefinition,
	SceneLayerEffectRGBCorrectionObjectEncodingDefinition,
	SceneLayerEffectLUTCorrectionObjectEncodingDefinition,
	SceneLayerEffectVirtualPTZObjectEncodingDefinition,
	SceneLayerEffectToneCurveCorrectionObjectEncodingDefinition,
	SceneLayerEffectMatrixCorrectionObjectEncodingDefinition,
	SceneLayerEffectTemperatureCorrectionObjectEncodingDefinition,
	SceneLayerEffectLinearKeyObjectEncodingDefinition,
	SceneLayerEffectPositionObjectEncodingDefinition,
	SceneLayerEffectPCropObjectEncodingDefinition,
	SceneLayerEffectFilmLookObjectEncodingDefinition,
	SceneLayerEffectGlowEffectObjectEncodingDefinition,
	SceneTransitionObjectEncodingDefinition,
	SceneTransitionMixEffectObjectEncodingDefinition,
	SceneSnapshotObjectEncodingDefinition,
	MacroObjectEncodingDefinition,
	ClipPlayerObjectEncodingDefinition,
	MediaObjectEncodingDefinition,
	GfxChannelObjectEncodingDefinition,
	GfxSceneObjectEncodingDefinition,
	GfxSceneItemObjectEncodingDefinition,
	GfxSceneHTMLElementItemObjectEncodingDefinition,
} from './object-encoding/index.js'

export class KairosConnection extends MinimalKairosConnection {
	async #getObject<TObj>(pathPrefix: string, definition: ObjectEncodingDefinition<TObj>): Promise<TObj> {
		const attributeNames = getProtocolAttributeNames(definition)

		const values = await this.getAttributes(pathPrefix, attributeNames)

		return Object.fromEntries(
			Object.entries<ObjectValueEncodingDefinition<TObj, any>>(definition).map(([id, def]) => {
				const value = values[def.protocolName]
				if (value === undefined) {
					throw new Error(`Missing attribute "${def.protocolName}" in response for path "${pathPrefix}"`)
				}
				return [id, def.parser(value) as any] // TODO - type this properly
			})
		) as TObj
	}

	#subscribeObject<TObj>(
		pathPrefix: string,
		definition: ObjectEncodingDefinition<TObj>,
		signal: AbortSignal,
		callback: (error: Error | null, value: TObj | null) => void
	): void {
		const attributeNames = getProtocolAttributeNames(definition)
		const pendingAttributes = new Set<string>(attributeNames)
		const valueObject: TObj = {} as any // This will be fully populated by the time the callback is first called

		// Create a combined signal, that will abort if either the original signal or the localAbort signal is aborted
		const localAbort = new AbortController()
		const combinedSignal = AbortSignal.any([signal, localAbort.signal])

		const updateValueCallback: SubscriptionCallback<string> = (path, error, value) => {
			if (localAbort.signal.aborted) return

			if (!error && value === null) error = new Error(`Received null value for path: ${path}. This is unexpected.`)

			if (error) {
				// Terminate other subscriptions and stop this callback from being called again
				localAbort.abort()

				callback(error, null)
				return
			}

			if (!path.startsWith(pathPrefix)) return // This shouldn't happen, but just in case
			const attributeName = path.slice(pathPrefix.length + 1)

			const transferDefinition = Object.entries<ObjectValueEncodingDefinition<TObj, any>>(definition).find(
				([_id, def]) => def.protocolName === attributeName
			)
			if (!transferDefinition) {
				// Terminate other subscriptions and stop this callback from being called again
				localAbort.abort()

				callback(new Error('Got value for unknown attribute: ' + attributeName), null)
				return
			}

			try {
				valueObject[transferDefinition[0] as keyof TObj] = transferDefinition[1].parser(value as string)
			} catch (e) {
				// Terminate the subscription and stop this callback from being called again
				localAbort.abort()

				callback(new TerminateSubscriptionError(`Failed to parse value for attribute "${attributeName}": ${e}`), null)
				return
			}

			// Check if the object has been fully populated
			pendingAttributes.delete(attributeName)
			if (pendingAttributes.size === 0) {
				// Future: Maybe this should be debounced, to avoid calling multiple times in a row. But that is easy enough for consumers to do themselves.
				callback(null, valueObject)
			}
		}

		// Start the subscription for each attribute
		for (const attributeName of attributeNames) {
			// Check if the signal is already aborted before creating more subscriptions
			if (combinedSignal.aborted) break

			const path = `${pathPrefix}.${attributeName}`
			this.subscribeValue(path, combinedSignal, updateValueCallback)
		}
	}

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
		return this.#getObject(refToPath(sceneRef), SceneObjectEncodingDefinition)
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
		return this.#getObject(refToPath(layerRef), SceneLayerObjectEncodingDefinition)
	}

	subscribeSceneLayer(
		layerRef: SceneLayerRef,
		signal: AbortSignal,
		callback: (error: Error | null, value: SceneLayerObject | null) => void
	): void {
		return this.#subscribeObject(refToPath(layerRef), SceneLayerObjectEncodingDefinition, signal, callback)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectCropObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectTransform2DObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectLuminanceKeyObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectChromaKeyObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectYUVCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectRGBCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectLUTCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectVirtualPTZObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectToneCurveCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectMatrixCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectTemperatureCorrectionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectLinearKeyObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectPositionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectPCropObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectFilmLookObjectEncodingDefinition)
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
		return this.#getObject(refToPath(effectRef), SceneLayerEffectGlowEffectObjectEncodingDefinition)
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
		return this.#getObject(refToPath(sceneTransitionRef), SceneTransitionObjectEncodingDefinition)
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
		return this.#getObject(refToPath(sceneTransitionMixEffectRef), SceneTransitionMixEffectObjectEncodingDefinition)
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
		return this.#getObject(refToPath(snapshotRef), SceneSnapshotObjectEncodingDefinition)
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
		return this.#getObject(`RR${ramRecorderId}`, ClipPlayerObjectEncodingDefinition)
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
		return this.#getObject(`CP${playerId}`, ClipPlayerObjectEncodingDefinition)
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
		return this.#getObject(`${basePath}.${mediaName}`, MediaObjectEncodingDefinition).catch(async (error) => {
			if (error instanceof ResponseError) {
				// Check if the clip exists, or there actually was an error:
				const objectList = await this.getList(basePath)
				if (!objectList.includes(mediaName)) {
					// The object does not exist, so we return undefined
					return undefined
				}
			}
			throw error
		})
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
		return this.#getObject(refToPath(macroRef), MacroObjectEncodingDefinition)
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
	async getGfxChannel(gfxChannelId: number): Promise<GfxChannelObject> {
		this._assertGfxChannelIdIsValid(gfxChannelId)
		return this.#getObject(`GFX${gfxChannelId}`, GfxChannelObjectEncodingDefinition)
	}
	async updateGfxChannel(gfxChannelId: number, props: Partial<UpdateGfxChannelObject>): Promise<void> {
		this._assertGfxChannelIdIsValid(gfxChannelId)
		await this.setAttributes(`GFX${gfxChannelId}`, [{ attribute: 'scene', value: stringifyGfxSceneRef(props.scene) }])
	}
	private _assertGfxChannelIdIsValid(gfxChannelId: number): void {
		if (typeof gfxChannelId !== 'number' || gfxChannelId < 1 || gfxChannelId > 2) {
			throw new Error(`Invalid gfxChannelId: ${gfxChannelId}. Must be between 1 and 2.`)
		}
	}
	// GFXSCENES
	// 	GfxScene
	async listGfxScenes(
		gfxSceneRef: GfxSceneRef = { realm: 'gfxScene', scenePath: [] },
		deep?: boolean
	): Promise<(GfxSceneRef & { name: string })[]> {
		return (await this._listDeep(gfxSceneRef, [], deep)).map((itemPath) => {
			return {
				realm: 'gfxScene',
				name: itemPath[itemPath.length - 1],
				scenePath: itemPath.slice(1), // remove the "GFXSCENES" part
			}
		})
	}
	async getGfxScene(gfxSceneRef: GfxSceneRef): Promise<GfxSceneObject> {
		return this.#getObject(refToPath(gfxSceneRef), GfxSceneObjectEncodingDefinition)
	}
	async updateGfxScene(gfxSceneRef: GfxSceneRef, props: Partial<UpdateGfxSceneObject>): Promise<void> {
		await this.setAttributes(refToPath(gfxSceneRef), [
			{ attribute: 'resolution', value: stringifyEnum<SceneResolution>(props.resolution, SceneResolution) },
		])
	}
	async listGfxSceneItems(gfxSceneRef: GfxSceneRef): Promise<(GfxSceneItemRef & { name: string })[]> {
		return (await this._listDeep(refToPath(gfxSceneRef), [], false)).map((itemPath) => {
			return {
				realm: 'gfxScene-item',
				name: itemPath[itemPath.length - 1],
				scenePath: gfxSceneRef.scenePath,
				sceneItemPath: itemPath,
			}
		})
	}
	async getGfxSceneItem(gfxSceneItemRef: GfxSceneItemRef): Promise<GfxSceneItemObject> {
		return await this.#getObject(refToPath(gfxSceneItemRef), GfxSceneItemObjectEncodingDefinition)
	}
	async updateGfxSceneItem(gfxSceneItemRef: GfxSceneItemRef, props: Partial<UpdateGfxSceneItemObject>): Promise<void> {
		await this.setAttributes(refToPath(gfxSceneItemRef), [
			{ attribute: 'width', value: stringifyInteger(props.width) },
			{ attribute: 'height', value: stringifyInteger(props.height) },
			{ attribute: 'position', value: stringifyPos2D(props.position) },
		])
	}
	async getGfxSceneHTMLElementItem(gfxSceneItemRef: GfxSceneItemRef): Promise<GfxSceneHTMLElementItemObject> {
		return await this.#getObject(refToPath(gfxSceneItemRef), GfxSceneHTMLElementItemObjectEncodingDefinition)
	}
	async updateGfxSceneHTMLElementItem(
		gfxSceneItemRef: GfxSceneItemRef,
		props: Partial<UpdateGfxSceneHTMLElementItemObject>
	): Promise<void> {
		await Promise.all([
			this.updateGfxSceneItem(gfxSceneItemRef, props),
			this.setAttributes(refToPath(gfxSceneItemRef), [{ attribute: 'url', value: props.url }]),
		])
	}
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
