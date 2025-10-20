import {
	stringifyBoolean,
	stringifyCommaSeparated,
	stringifyEnum,
	stringifyFloat,
	stringifyInteger,
	stringifyColorRGB,
	stringifyPos2D,
	stringifyAnySourceRef,
	stringifyRef,
	stringifyImageStoreClip,
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
	Resolution,
	SceneLimitOffAction,
	PlayerTMS,
	SceneLayerPgmPstMode,
	SceneLayerMode,
	DissolveMode,
	SceneLayerBlendMode,
	EffectCropObject,
	UpdateEffectCropObject,
	EffectTransform2DObject,
	UpdateEffectTransform2DObject,
	EffectLuminanceKeyObject,
	UpdateEffectLuminanceKeyObject,
	EffectLuminanceKeyBlendMode,
	EffectChromaKeyObject,
	UpdateEffectChromaKeyObject,
	EffectChromaKeyEdgeSmoothingSize,
	EffectFilmLookObject,
	EffectGlowEffectObject,
	EffectLinearKeyBlendMode,
	EffectLinearKeyObject,
	EffectLUTCorrectionObject,
	EffectMatrixCorrectionObject,
	EffectPCropObject,
	EffectPositionObject,
	EffectRGBCorrectionObject,
	EffectTemperatureCorrectionObject,
	EffectToneCurveCorrectionObject,
	EffectVirtualPTZObject,
	EffectYUVCorrectionObject,
	UpdateEffectFilmLookObject,
	UpdateEffectGlowEffectObject,
	UpdateEffectLinearKeyObject,
	UpdateEffectLUTCorrectionObject,
	UpdateEffectMatrixCorrectionObject,
	UpdateEffectPCropObject,
	UpdateEffectPositionObject,
	UpdateEffectRGBCorrectionObject,
	UpdateEffectTemperatureCorrectionObject,
	UpdateEffectToneCurveCorrectionObject,
	UpdateEffectVirtualPTZObject,
	UpdateEffectYUVCorrectionObject,
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
	AuxObject,
	UpdateAuxObject,
	AudioAuxObject,
	UpdateAudioAuxObject,
	AudioPlayerObject,
	UpdateAudioPlayerObject,
	AudioMixerObject,
	UpdateAudioMixerObject,
	ImageStoreObject,
	UpdateImageStoreObject,
	ImageStoreScaleMode,
	InputObject,
	UpdateInputObject,
	FxInputObject,
	ScaleMode,
	UpdateFxInputObject,
	AnyRef,
	AuxEffectRef,
	AuxRef,
	AudioMixerChannelRef,
	GfxSceneItemRef,
	GfxSceneRef,
	isRef,
	MacroRef,
	pathRoRef,
	refToPath,
	SceneLayerEffectRef,
	SceneLayerRef,
	SceneRef,
	SceneSnapshotRef,
	SceneTransitionMixEffectRef,
	SceneTransitionMixRef,
	SceneTransitionRef,
	splitPath,
	FxInputRef,
	MatteRef,
	protocolDecodePath,
	protocolEncodePath,
	RefPath,
	RefPathSingle,
	RamRecPlayerObject,
	UpdateRamRecPlayerObject,
	IpInputSettingObject,
	UpdateIpInputSettingObject,
	refSDIInputSetting,
	SDIInputSettingObject,
	UpdateSDIInputSettingObject,
	NDIInputSettingObject,
	refNDIInputSetting,
	refStreamInputSetting,
	UpdateStreamInputSettingObject,
	IpOutputSettingObject,
	NDIInputSettingRef,
	SDIOutputSettingObject,
	SDIOutputSettingRef,
	NDIOutputSettingObject,
	IpInputSettingRef,
	SDIInputSettingRef,
	UpdateStreamOutputSettingObject,
	refAudioOutputSetting,
	refIpOutputSetting,
	refStreamOutputSetting,
	refNDIOutputSetting,
	AudioOutputSettingRef,
	UpdateAudioOutputSettingObject,
	refIpInputSetting,
	StreamInputSettingRef,
	IpOutputSettingRef,
	StreamInputSettingObject,
	UpdateIpOutputSettingObject,
	refSDIOutputSetting,
	UpdateSDIOutputSettingObject,
	NDIOutputSettingRef,
	UpdateNDIOutputSettingObject,
	StreamOutputSettingRef,
	StreamOutputSettingObject,
	AudioOutputSettingObject,
	AnyInputRef,
	refClipPlayer,
	ClipPlayerRef,
	AudioPlayerRef,
	refAudioPlayer,
	refImageStore,
	ImageStoreRef,
	refRamRecorder,
	MediaSoundRef,
	MediaClipRef,
	MediaStillRef,
	MediaRamRecRef,
	MediaImageRef,
	RamRecorderRef,
} from 'kairos-lib'
import { ResponseError, TerminateSubscriptionError } from './minimal/errors.js'
import {
	getProtocolAttributeNames,
	ObjectEncodingDefinition,
	ObjectValueEncodingDefinition,
	SceneObjectEncodingDefinition,
	SceneLayerObjectEncodingDefinition,
	EffectCropObjectEncodingDefinition,
	EffectTransform2DObjectEncodingDefinition,
	EffectLuminanceKeyObjectEncodingDefinition,
	EffectChromaKeyObjectEncodingDefinition,
	EffectYUVCorrectionObjectEncodingDefinition,
	EffectRGBCorrectionObjectEncodingDefinition,
	EffectLUTCorrectionObjectEncodingDefinition,
	EffectVirtualPTZObjectEncodingDefinition,
	EffectToneCurveCorrectionObjectEncodingDefinition,
	EffectMatrixCorrectionObjectEncodingDefinition,
	EffectTemperatureCorrectionObjectEncodingDefinition,
	EffectLinearKeyObjectEncodingDefinition,
	EffectPositionObjectEncodingDefinition,
	EffectPCropObjectEncodingDefinition,
	EffectFilmLookObjectEncodingDefinition,
	EffectGlowEffectObjectEncodingDefinition,
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
	EncodeUpdateEffectCropObject,
	EncodeUpdateEffectTransform2DObject,
	EncodeUpdateEffectPositionObject,
	EncodeUpdateEffectVirtualPTZObject,
	EncodeUpdateEffectPCropObject,
	EncodeUpdateEffectYUVCorrectionObject,
	EncodeUpdateEffectLUTCorrectionObject,
	EncodeUpdateEffectRGBCorrectionObject,
	EncodeUpdateEffectToneCurveCorrectionObject,
	EncodeUpdateEffectMatrixCorrectionObject,
	EncodeUpdateEffectTemperatureCorrectionObject,
	EncodeUpdateEffectFilmLookObject,
	EncodeUpdateEffectGlowEffectObject,
	AudioPlayerObjectEncodingDefinition,
	AudioMixerObjectEncodingDefinition,
	AudioAuxObjectEncodingDefinition,
	AuxObjectEncodingDefinition,
	ImageStoreObjectEncodingDefinition,
	InputObjectEncodingDefinition,
	FxInputObjectEncodingDefinition,
	RamRecPlayerObjectEncodingDefinition,
} from './object-encoding/index.js'
import { omitFalsy } from './lib/lib.js'
import {
	IpInputSettingEncodingDefinition,
	NDIInputSettingEncodingDefinition,
	SDIInputSettingEncodingDefinition,
	StreamInputSettingEncodingDefinition,
} from './object-encoding/inputSettings.js'
import {
	AudioOutputSettingEncodingDefinition,
	IpOutputSettingEncodingDefinition,
	NDIOutputSettingEncodingDefinition,
	SDIOutputSettingEncodingDefinition,
	StreamOutputSettingEncodingDefinition,
} from './object-encoding/outputSettings.js'

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

	async listIpInputSettings(): Promise<IpInputSettingRef[]> {
		// "IN_IP4"
		const list = await this.getList('IPINPUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^IN_IP(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refIpInputSetting(index)
			})
		)
	}
	async getIpInputSetting(ipInputSettingRef: IpInputSettingRef): Promise<IpInputSettingObject> {
		return this.#getObject(refToPath(ipInputSettingRef), IpInputSettingEncodingDefinition)
	}
	async updateIpInputSetting(
		ipInputSettingRef: IpInputSettingRef,
		props: Partial<UpdateIpInputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(ipInputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
			{ attribute: 'on_demand', value: stringifyBoolean(props.onDemand) },
		])
	}

	async listSDIInputSettings(): Promise<SDIInputSettingRef[]> {
		// "IN_SDI10"
		const list = await this.getList('SDIINPUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^IN_SDI(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refSDIInputSetting(index)
			})
		)
	}
	async getSDIInputSetting(sdiInputSettingRef: SDIInputSettingRef): Promise<SDIInputSettingObject> {
		return this.#getObject(refToPath(sdiInputSettingRef), SDIInputSettingEncodingDefinition)
	}
	async updateSDIInputSetting(
		sdiInputSettingRef: SDIInputSettingRef,
		props: Partial<UpdateSDIInputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(sdiInputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
		])
	}
	async listNDIInputSettings(): Promise<NDIInputSettingRef[]> {
		// "IN_NDI1"
		const list = await this.getList('NDIINPUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^IN_NDI(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refNDIInputSetting(index)
			})
		)
	}
	async getNDIInputSetting(ndiInputSettingRef: NDIInputSettingRef): Promise<NDIInputSettingObject> {
		return this.#getObject(refToPath(ndiInputSettingRef), NDIInputSettingEncodingDefinition)
	}
	async listStreamInputsSetting(): Promise<StreamInputSettingRef[]> {
		// "IN_STREAM"
		const list = await this.getList('STREAMINPUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^IN_STREAM(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refStreamInputSetting(index)
			})
		)
	}
	async getStreamInputSetting(streamInputSettingRef: StreamInputSettingRef): Promise<StreamInputSettingObject> {
		return this.#getObject(refToPath(streamInputSettingRef), StreamInputSettingEncodingDefinition)
	}
	async updateStreamInputSetting(
		streamInputSettingRef: StreamInputSettingRef,
		props: Partial<UpdateStreamInputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(streamInputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
		])
	}

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

	async listIpOutputSettings(): Promise<IpOutputSettingRef[]> {
		// "OUT_IP"
		const list = await this.getList('IPOUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^OUT_IP(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refIpOutputSetting(index)
			})
		)
	}
	async getIpOutputSetting(ipOutputSettingRef: IpOutputSettingRef): Promise<IpOutputSettingObject> {
		return this.#getObject(refToPath(ipOutputSettingRef), IpOutputSettingEncodingDefinition)
	}
	async updateIpOutputSetting(
		ipOutputSettingRef: IpOutputSettingRef,
		props: Partial<UpdateIpOutputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(ipOutputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
		])
	}
	async listSDIOutputSettings(): Promise<SDIOutputSettingRef[]> {
		// "OUT_SDI"
		const list = await this.getList('SDIOUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^OUT_SDI(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refSDIOutputSetting(index)
			})
		)
	}
	async getSDIOutputSetting(sdiOutputSettingRef: SDIOutputSettingRef): Promise<SDIOutputSettingObject> {
		return this.#getObject(refToPath(sdiOutputSettingRef), SDIOutputSettingEncodingDefinition)
	}
	async updateSDIOutputSetting(
		sdiOutputSettingRef: SDIOutputSettingRef,
		props: Partial<UpdateSDIOutputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(sdiOutputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
		])
	}
	async listNDIOutputSettings(): Promise<NDIOutputSettingRef[]> {
		// "OUT_NDI"
		const list = await this.getList('NDIOUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^OUT_NDI(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refNDIOutputSetting(index)
			})
		)
	}
	async getNDIOutputSetting(ndiOutputSettingRef: NDIOutputSettingRef): Promise<NDIOutputSettingObject> {
		return this.#getObject(refToPath(ndiOutputSettingRef), NDIOutputSettingEncodingDefinition)
	}
	async updateNDIOutputSetting(
		ndiOutputSettingRef: NDIOutputSettingRef,
		props: Partial<UpdateNDIOutputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(ndiOutputSettingRef), [
			{ attribute: 'delay', value: stringifyInteger(props.delay) },
		])
	}
	async listStreamOutputSettings(): Promise<StreamOutputSettingRef[]> {
		// "OUT_STREAM"
		const list = await this.getList('STREAMOUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^OUT_STREAM(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refStreamOutputSetting(index)
			})
		)
	}
	async getStreamOutputSetting(streamOutputSettingRef: StreamOutputSettingRef): Promise<StreamOutputSettingObject> {
		return this.#getObject(refToPath(streamOutputSettingRef), StreamOutputSettingEncodingDefinition)
	}
	async updateStreamOutputSetting(
		streamOutputRef: StreamOutputSettingRef,
		props: Partial<UpdateStreamOutputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(streamOutputRef), [{ attribute: 'delay', value: stringifyInteger(props.delay) }])
	}
	async listAudioOutputSettings(): Promise<AudioOutputSettingRef[]> {
		// "OUT_AUDIO"
		const list = await this.getList('AUDIOOUTS')

		return omitFalsy(
			list.map((rawPath) => {
				const m = rawPath.match(/^OUT_AUDIO(\d+)$/)
				if (!m) return null
				const index = parseInt(m[1], 10)
				if (Number.isNaN(index)) return null
				return refAudioOutputSetting(index)
			})
		)
	}
	async getAudioOutputSetting(audioOutputRef: AudioOutputSettingRef): Promise<AudioOutputSettingObject> {
		return this.#getObject(refToPath(audioOutputRef), AudioOutputSettingEncodingDefinition)
	}
	async updateAudioOutputSetting(
		audioOutputRef: AudioOutputSettingRef,
		props: Partial<UpdateAudioOutputSettingObject>
	): Promise<void> {
		await this.setAttributes(refToPath(audioOutputRef), [{ attribute: 'delay', value: stringifyInteger(props.delay) }])
	}

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
			{ attribute: 'resolution', value: stringifyEnum<Resolution>(props.resolution, Resolution) },
			{
				attribute: 'next_transition',
				value: stringifyCommaSeparated(
					props.nextTransition?.map((o) => stringifyRef<SceneTransitionRef>('scene-transition', o))
				),
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
			{ attribute: 'sourceA', value: stringifyAnySourceRef(props.sourceA) },
			{ attribute: 'source_pgm', value: stringifyAnySourceRef(props.sourcePgm) },
			{ attribute: 'source_pst', value: stringifyAnySourceRef(props.sourcePst) },
			{ attribute: 'pgm_pst_mode', value: stringifyEnum<SceneLayerPgmPstMode>(props.pgmPstMode, SceneLayerPgmPstMode) },
			{
				attribute: 'sourceOptions',
				value: stringifyCommaSeparated(props.sourceOptions?.map((o) => stringifyAnySourceRef(o))),
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
				value: stringifyEnum<DissolveMode>(props.dissolveMode, DissolveMode),
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
	async getSceneLayerEffectCrop(effectRef: SceneLayerEffectRef): Promise<EffectCropObject> {
		return this.#getObject(refToPath(effectRef), EffectCropObjectEncodingDefinition)
	}
	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectCrop(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectCropObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectCropObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectTransform2D(effectRef: SceneLayerEffectRef): Promise<EffectTransform2DObject> {
		return this.#getObject(refToPath(effectRef), EffectTransform2DObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectTransform2D(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectTransform2DObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectTransform2DObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLuminanceKey(effectRef: SceneLayerEffectRef): Promise<EffectLuminanceKeyObject> {
		return this.#getObject(refToPath(effectRef), EffectLuminanceKeyObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLuminanceKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectLuminanceKeyObject>
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
				value: stringifyEnum<EffectLuminanceKeyBlendMode>(props.blendMode, EffectLuminanceKeyBlendMode),
			},
			{ attribute: 'sourceKey', value: stringifyAnySourceRef(props.sourceKey) },
		])
	}
	async sceneLayerEffectLuminanceKeyAutoAdjust(effectRef: SceneLayerEffectRef): Promise<void> {
		return this.executeFunction(`${refToPath(effectRef)}.auto_adjust`)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectChromaKey(effectRef: SceneLayerEffectRef): Promise<EffectChromaKeyObject> {
		return this.#getObject(refToPath(effectRef), EffectChromaKeyObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectChromaKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectChromaKeyObject>
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
				value: stringifyEnum<EffectChromaKeyEdgeSmoothingSize>(
					props.edgeSmoothingSize,
					EffectChromaKeyEdgeSmoothingSize
				),
			},
		])
	}
	async sceneLayerEffectChromaKeyAutoAdjust(effectRef: SceneLayerEffectRef): Promise<void> {
		return this.executeFunction(`${refToPath(effectRef)}.auto_adjust`)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectYUVCorrection(effectRef: SceneLayerEffectRef): Promise<EffectYUVCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectYUVCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectYUVCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectYUVCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectYUVCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectRGBCorrection(effectRef: SceneLayerEffectRef): Promise<EffectRGBCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectRGBCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectRGBCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectRGBCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectRGBCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLUTCorrection(effectRef: SceneLayerEffectRef): Promise<EffectLUTCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectLUTCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLUTCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectLUTCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectLUTCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectVirtualPTZ(effectRef: SceneLayerEffectRef): Promise<EffectVirtualPTZObject> {
		return this.#getObject(refToPath(effectRef), EffectVirtualPTZObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectVirtualPTZ(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectVirtualPTZObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectVirtualPTZObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectToneCurveCorrection(
		effectRef: SceneLayerEffectRef
	): Promise<EffectToneCurveCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectToneCurveCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectToneCurveCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectToneCurveCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectToneCurveCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectMatrixCorrection(effectRef: SceneLayerEffectRef): Promise<EffectMatrixCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectMatrixCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectMatrixCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectMatrixCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectMatrixCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectTemperatureCorrection(
		effectRef: SceneLayerEffectRef
	): Promise<EffectTemperatureCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectTemperatureCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectTemperatureCorrection(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectTemperatureCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectTemperatureCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectLinearKey(effectRef: SceneLayerEffectRef): Promise<EffectLinearKeyObject> {
		return this.#getObject(refToPath(effectRef), EffectLinearKeyObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectLinearKey(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectLinearKeyObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), [
			{ attribute: 'enabled', value: stringifyBoolean(props.enabled) },
			{ attribute: 'invert', value: stringifyBoolean(props.invert) },
			{ attribute: 'key_source', value: stringifyAnySourceRef(props.keySource) },
			{
				attribute: 'blend_mode',
				value: stringifyEnum<EffectLinearKeyBlendMode>(props.blendMode, EffectLinearKeyBlendMode),
			},
		])
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectPosition(effectRef: SceneLayerEffectRef): Promise<EffectPositionObject> {
		return this.#getObject(refToPath(effectRef), EffectPositionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectPosition(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectPositionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectPositionObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectPCrop(effectRef: SceneLayerEffectRef): Promise<EffectPCropObject> {
		return this.#getObject(refToPath(effectRef), EffectPCropObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectPCrop(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectPCropObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectPCropObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectFilmLook(effectRef: SceneLayerEffectRef): Promise<EffectFilmLookObject> {
		return this.#getObject(refToPath(effectRef), EffectFilmLookObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectFilmLook(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectFilmLookObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectFilmLookObject(props))
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async getSceneLayerEffectGlowEffect(effectRef: SceneLayerEffectRef): Promise<EffectGlowEffectObject> {
		return this.#getObject(refToPath(effectRef), EffectGlowEffectObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listSceneLayerEffects() */
	async updateSceneLayerEffectGlowEffect(
		effectRef: SceneLayerEffectRef,
		props: Partial<UpdateEffectGlowEffectObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectGlowEffectObject(props))
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
	}
	// SOURCES:
	// 	FXINPUTS
	// 		Fx
	async listFxInputs(): Promise<(FxInputRef & { name: string })[]> {
		const itemPaths = await this._listDeep(`FXINPUTS`, ['SourceEffectGroup'], true)

		return this._filterAwayFolders(itemPaths).map((itemPath) => {
			return {
				realm: 'fxInput',
				name: itemPath.slice(1)[itemPath.length - 2],
				fxInputPath: itemPath.slice(1), // remove the "FXINPUTS" part
			}
		})
	}

	async getFxInput(fxInputRef: FxInputRef): Promise<FxInputObject> {
		return this.#getObject(refToPath(fxInputRef), FxInputObjectEncodingDefinition)
	}
	async updateFxInput(fxInputRef: FxInputRef, props: Partial<UpdateFxInputObject>): Promise<void> {
		await this.setAttributes(refToPath(fxInputRef), [
			{ attribute: 'name', value: props.name },
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			// { attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'scale_mode', value: stringifyEnum<ScaleMode>(props.scaleMode, ScaleMode) },
			{ attribute: 'resolution', value: stringifyEnum<Resolution>(props.resolution, Resolution) },
			{ attribute: 'advanced_resolution_control', value: stringifyBoolean(props.advancedResolutionControl) },
			// { attribute: 'resolution_x', value: stringifyInteger(props.resolutionX) },
			// { attribute: 'resolution_y', value: stringifyInteger(props.resolutionY) },
		])
	}
	// 	FXINPUTS.Fx.SourceEffectGroup
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
	async listMattes(): Promise<(MatteRef & { name: string })[]> {
		const itemPaths = await this._listDeep(`MATTES`, [], true)

		// Filter away folders:
		const pathsSet = new Set<string>()
		for (const p of itemPaths) {
			const dirPath = p.slice(0, -1).join('.') // omit last, making it a dirPath
			pathsSet.add(dirPath)
		}
		return itemPaths
			.filter((p) => {
				const myPath = p.join('.')
				return !pathsSet.has(myPath) // If myPath exists in the set, it means I'm a folder
			})
			.map((itemPath) => {
				return {
					realm: 'matte',
					name: itemPath.slice(1)[itemPath.length - 2],
					mattePath: itemPath.slice(1), // remove the "MATTES" part
				}
			})
	}
	// 	MATTES
	// 		ColorMatte
	// 		TestPattern
	// 		Shaped
	// 		Rays
	// 		Starfield

	// RAMRECORDERS
	// 	RR<1-8>
	async listRamRecorders(): Promise<RamRecorderRef[]> {
		return omitFalsy(
			(await this.getList('RAMRECORDERS')).map((path) => {
				// "RR1"
				if (!path.startsWith('RR')) return undefined
				const playerId = parseInt(path.slice(2), 10)
				return refRamRecorder(playerId)
			})
		)
	}
	async getRamRecorder(ramRecorderId: number | RamRecorderRef): Promise<RamRecPlayerObject> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.#getObject(refToPath(refRamRecorder(ramRecorderId)), RamRecPlayerObjectEncodingDefinition)
	}
	async loadRamRecorderClip(
		ramRecorderId: number | RamRecorderRef,
		clip: RamRecPlayerObject['clip'],
		position?: number
	): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		await this._loadPlayerClip(
			refToPath(refRamRecorder(ramRecorderId)),
			stringifyRef<MediaRamRecRef>('media-ramrec', clip),
			position
		)
	}
	async updateRamRecorder(
		ramRecorderId: number | RamRecorderRef,
		props: Partial<UpdateRamRecPlayerObject>
	): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)

		await this.setAttributes(refToPath(refRamRecorder(ramRecorderId)), [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'clip', value: stringifyRef<MediaRamRecRef>('media-ramrec', props.clip) }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInteger(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyEnum<PlayerTMS>(props.tms, PlayerTMS) },
			{ attribute: 'autoplay', value: stringifyBoolean(props.autoplay) },
			// 'tally' is read-only, so can't be set
		])
	}
	async ramRecorderBegin(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.begin`)
	}
	async ramRecorderRewind(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.rewind`)
	}
	async ramRecorderStepBack(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.step_back`)
	}
	async ramRecorderReverse(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.reverse`)
	}
	async ramRecorderPlay(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.play`)
	}
	async ramRecorderPlayLoop(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.play_loop`)
	}
	async ramRecorderPause(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.pause`)
	}
	async ramRecorderStop(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.stop`)
	}
	async ramRecorderStepForward(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.step_forward`)
	}
	async ramRecorderFastForward(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.fast_forward`)
	}
	async ramRecorderEnd(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.end`)
	}
	async ramRecorderPlaylistBegin(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.playlist_begin`)
	}
	async ramRecorderPlaylistBack(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.playlist_back`)
	}
	async ramRecorderPlaylistNext(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.playlist_next`)
	}
	async ramRecorderPlaylistEnd(ramRecorderId: number | RamRecorderRef): Promise<void> {
		ramRecorderId = this._assertRamRecIdIsValid(ramRecorderId)
		return this.executeFunction(`${refToPath(refRamRecorder(ramRecorderId))}.playlist_end`)
	}
	private _assertRamRecIdIsValid(ramRecorderId: number | RamRecorderRef): number {
		if (typeof ramRecorderId === 'object') {
			if (ramRecorderId.realm !== 'ramRecorder') throw new Error(`Invalid ramRecorderId realm: ${ramRecorderId.realm}.`)
			ramRecorderId = ramRecorderId.playerIndex
		}
		this._assertPlayerIdIsValid(ramRecorderId)
		return ramRecorderId
	}

	// PLAYERS
	// 	CP<1-2>
	async listClipPlayers(): Promise<ClipPlayerRef[]> {
		return omitFalsy(
			(await this.getList('PLAYERS')).map((path) => {
				// "CP1"
				if (!path.startsWith('CP')) return undefined
				const playerId = parseInt(path.slice(2), 10)
				return refClipPlayer(playerId)
			})
		)
	}
	async getClipPlayer(playerId: number | ClipPlayerRef): Promise<ClipPlayerObject> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.#getObject(refToPath(refClipPlayer(playerId)), ClipPlayerObjectEncodingDefinition)
	}
	async loadClipPlayerClip(
		playerId: number | ClipPlayerRef,
		clip: Required<UpdateClipPlayerObject>['clip'],
		position?: number
	): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		await this._loadPlayerClip(
			refToPath(refClipPlayer(playerId)),
			stringifyRef<MediaClipRef>('media-clip', clip),
			position
		)
	}
	async updateClipPlayer(playerId: number | ClipPlayerRef, props: Partial<UpdateClipPlayerObject>): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		await this.setAttributes(refToPath(refClipPlayer(playerId)), [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'clip', value: stringifyRef<MediaClipRef>('media-clip', props.clip) }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInteger(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyEnum<PlayerTMS>(props.tms, PlayerTMS) },
			{ attribute: 'autoplay', value: stringifyBoolean(props.autoplay) },
			// 'tally' is read-only, so can't be set
		])
	}
	async clipPlayerBegin(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.begin`)
	}
	async clipPlayerRewind(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.rewind`)
	}
	async clipPlayerStepBack(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.step_back`)
	}
	async clipPlayerReverse(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.reverse`)
	}
	async clipPlayerPlay(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.play`)
	}
	async clipPlayerPause(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.pause`)
	}
	async clipPlayerStop(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.stop`)
	}
	async clipPlayerStepForward(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.step_forward`)
	}
	async clipPlayerFastForward(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.fast_forward`)
	}
	async clipPlayerEnd(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.end`)
	}
	async clipPlayerPlaylistBegin(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.playlist_begin`)
	}
	async clipPlayerPlaylistBack(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.playlist_back`)
	}
	async clipPlayerPlaylistNext(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.playlist_next`)
	}
	async clipPlayerPlaylistEnd(playerId: number | ClipPlayerRef): Promise<void> {
		playerId = this._assertClipPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refClipPlayer(playerId))}.playlist_end`)
	}
	private _assertClipPlayerIdIsValid(playerId: number | ClipPlayerRef): number {
		if (typeof playerId === 'object') {
			if (playerId.realm !== 'clipPlayer') throw new Error(`Invalid playerId realm: ${playerId.realm}.`)
			playerId = playerId.playerIndex
		}
		this._assertPlayerIdIsValid(playerId)
		return playerId
	}
	/** Verifies that the id of a imageStore, ramRec, Audio or clip-player is reasonable, throws otherwise */
	private _assertPlayerIdIsValid(playerId: number): void {
		// Note: documentation mention upper limits, but we've seen higher numbers in the wild
		if (typeof playerId !== 'number' || playerId < 1 || Number.isNaN(playerId)) {
			throw new Error(`Invalid playerId: ${playerId}.`)
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

	async listMediaClips(
		path: MediaClipRef = { realm: 'media-clip', clipPath: [] },
		deep?: boolean
	): Promise<(MediaClipRef & { name: string })[]> {
		return this._filterAwayFolders(await this._listDeep(path, [], deep)).map((itemPath) => {
			return {
				realm: 'media-clip',
				name: itemPath[itemPath.length - 1],
				clipPath: itemPath.slice(2), // remove the "MEDIA.clips" part
			}
		})
	}
	async getMediaClip(ref: MediaClipRef): Promise<MediaObject | undefined> {
		return this._getMediaObject(ref)
	}
	async listMediaStills(
		path: MediaStillRef = { realm: 'media-still', clipPath: [] },
		deep?: boolean
	): Promise<(MediaStillRef & { name: string })[]> {
		return this._filterAwayFolders(await this._listDeep(path, [], deep)).map((itemPath) => {
			return {
				realm: 'media-still',
				name: itemPath[itemPath.length - 1],
				clipPath: itemPath.slice(2), // remove the "MEDIA.stills" part
			}
		})
	}

	async getMediaStill(ref: MediaStillRef): Promise<MediaObject | undefined> {
		return this._getMediaObject(ref)
	}

	async listMediaRamRec(
		path: MediaRamRecRef = { realm: 'media-ramrec', clipPath: [] },
		deep?: boolean
	): Promise<(MediaRamRecRef & { name: string })[]> {
		return this._filterAwayFolders(await this._listDeep(path, [], deep)).map((itemPath) => {
			return {
				realm: 'media-ramrec',
				name: itemPath[itemPath.length - 1],
				clipPath: itemPath.slice(2), // remove the "MEDIA.ramrec" part
			}
		})
	}
	async getMediaRamRec(ref: MediaRamRecRef): Promise<MediaObject | undefined> {
		return this._getMediaObject(ref)
	}
	async listMediaImage(
		path: MediaImageRef = { realm: 'media-image', clipPath: [] },
		deep?: boolean
	): Promise<(MediaImageRef & { name: string })[]> {
		return this._filterAwayFolders(await this._listDeep(path, [], deep)).map((itemPath) => {
			return {
				realm: 'media-image',
				name: itemPath[itemPath.length - 1],
				clipPath: itemPath.slice(2), // remove the "MEDIA.image" part
			}
		})
	}
	async getMediaImage(ref: MediaImageRef): Promise<MediaObject | undefined> {
		return this._getMediaObject(ref)
	}
	async listMediaSounds(
		path: MediaSoundRef = { realm: 'media-sound', clipPath: [] },
		deep?: boolean
	): Promise<(MediaSoundRef & { name: string })[]> {
		return this._filterAwayFolders(await this._listDeep(path, [], deep)).map((itemPath) => {
			return {
				realm: 'media-sound',
				name: itemPath[itemPath.length - 1],
				clipPath: itemPath.slice(2), // remove the "MEDIA.image" part
			}
		})
	}

	async getMediaSound(ref: MediaSoundRef): Promise<MediaObject | undefined> {
		return this._getMediaObject(ref)
	}

	private async _getMediaObject(
		ref: MediaClipRef | MediaStillRef | MediaRamRecRef | MediaImageRef | MediaSoundRef
	): Promise<MediaObject | undefined> {
		const path = refToPath(ref)

		return this.#getObject(path, MediaObjectEncodingDefinition).catch(async (error) => {
			if (error instanceof ResponseError) {
				const dirPath = path.split('.').slice(0, -1).join('.') // remove the last part (the media name)
				const mediaName = path.split('.').slice(-1)[0]
				// Check if the clip exists, or there actually was an error:
				const objectList = await this.getList(dirPath)
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
	async listAuxes(): Promise<AuxRef[]> {
		const rawAuxes = await this.getList('AUX')

		const auxes: AuxRef[] = []

		for (const auxPath of rawAuxes) {
			const ref = pathRoRef(auxPath)
			if (!isRef(ref) || ref.realm !== 'aux') {
				throw new Error(`Invalid aux path: ${auxPath}. Expected realm "aux".`)
			}

			auxes.push(ref)
		}

		return auxes
	}
	async getAux(auxRef: AuxRef): Promise<AuxObject> {
		return this.#getObject(refToPath(auxRef), AuxObjectEncodingDefinition)
	}
	async updateAux(auxRef: AuxRef, props: Partial<UpdateAuxObject>): Promise<void> {
		await this.setAttributes(refToPath(auxRef), [
			{ attribute: 'name', value: props.name },
			{
				attribute: 'sourceOptions',
				value: stringifyCommaSeparated(props.sourceOptions?.map((o) => stringifyAnySourceRef(o))),
			},
			{ attribute: 'source', value: stringifyAnySourceRef(props.source) },
			{ attribute: 'tally_root', value: stringifyInteger(props.tallyRoot) },
			// recordingStatus and available are read-only
		])
	}

	async auxRecord(auxRef: AuxRef, frameCount = -1, filename?: string): Promise<void> {
		const args: string[] = []
		if (frameCount >= 0) {
			args.push(frameCount.toString())
		}
		if (filename) {
			args.push(filename)
		}

		return this.executeFunction(`${refToPath(auxRef)}.record`, ...args)
	}

	async auxRecordLoop(auxRef: AuxRef, frameCount = -1, filename?: string): Promise<void> {
		const args: string[] = []
		if (frameCount >= 0) {
			args.push(frameCount.toString())
		}
		if (filename) {
			args.push(filename)
		}

		return this.executeFunction(`${refToPath(auxRef)}.record_loop`, ...args)
	}

	async auxRecordStop(auxRef: AuxRef): Promise<void> {
		return this.executeFunction(`${refToPath(auxRef)}.stop_record`)
	}

	async auxGrabStill(auxRef: AuxRef, filename?: string): Promise<void> {
		const args: string[] = []
		if (filename) {
			args.push(filename)
		}

		return this.executeFunction(`${refToPath(auxRef)}.grab`, ...args)
	}

	async listAuxEffects(auxRef: AuxRef, deep?: boolean): Promise<(AuxEffectRef & { name: string })[]> {
		return (await this._listDeep(`${refToPath(auxRef)}.Effects`, [], deep)).map((itemPath) => {
			const paths = splitPath(itemPath, 'Effects')
			if (paths.length !== 2)
				throw new Error(
					`Invalid Aux.Effects path: "${JSON.stringify(paths)}" ("Aux" or "Effects" missing) (${JSON.stringify(itemPath)})`
				)

			return {
				realm: 'aux-effect',
				name: paths[1][paths[1].length - 1],
				auxPath: auxRef.path,
				auxPathIsName: auxRef.pathIsName,
				effectPath: paths[1],
			}
		})
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectCrop(effectRef: AuxEffectRef): Promise<EffectCropObject> {
		return this.#getObject(refToPath(effectRef), EffectCropObjectEncodingDefinition)
	}
	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectCrop(effectRef: AuxEffectRef, props: Partial<UpdateEffectCropObject>): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectCropObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectYUVCorrection(effectRef: AuxEffectRef): Promise<EffectYUVCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectYUVCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectYUVCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectYUVCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectYUVCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectRGBCorrection(effectRef: AuxEffectRef): Promise<EffectRGBCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectRGBCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectRGBCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectRGBCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectRGBCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectLUTCorrection(effectRef: AuxEffectRef): Promise<EffectLUTCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectLUTCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectLUTCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectLUTCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectLUTCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectToneCurveCorrection(effectRef: AuxEffectRef): Promise<EffectToneCurveCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectToneCurveCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectToneCurveCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectToneCurveCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectToneCurveCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectMatrixCorrection(effectRef: AuxEffectRef): Promise<EffectMatrixCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectMatrixCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectMatrixCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectMatrixCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectMatrixCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectTemperatureCorrection(effectRef: AuxEffectRef): Promise<EffectTemperatureCorrectionObject> {
		return this.#getObject(refToPath(effectRef), EffectTemperatureCorrectionObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectTemperatureCorrection(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectTemperatureCorrectionObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectTemperatureCorrectionObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectFilmLook(effectRef: AuxEffectRef): Promise<EffectFilmLookObject> {
		return this.#getObject(refToPath(effectRef), EffectFilmLookObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectFilmLook(effectRef: AuxEffectRef, props: Partial<UpdateEffectFilmLookObject>): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectFilmLookObject(props))
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async getAuxEffectGlowEffect(effectRef: AuxEffectRef): Promise<EffectGlowEffectObject> {
		return this.#getObject(refToPath(effectRef), EffectGlowEffectObjectEncodingDefinition)
	}

	/** Note: This Effect is only available if listed using listAuxEffects() */
	async updateAuxEffectGlowEffect(
		effectRef: AuxEffectRef,
		props: Partial<UpdateEffectGlowEffectObject>
	): Promise<void> {
		await this.setAttributes(refToPath(effectRef), EncodeUpdateEffectGlowEffectObject(props))
	}

	// 	AUDIO-AUX<1-8>
	async getAudioAux(auxRef: AuxRef): Promise<AudioAuxObject> {
		return this.#getObject(refToPath(auxRef), AudioAuxObjectEncodingDefinition)
	}
	async updateAudioAux(auxRef: AuxRef, props: Partial<UpdateAudioAuxObject>): Promise<void> {
		await this.setAttributes(refToPath(auxRef), [
			{ attribute: 'name', value: props.name },
			{
				attribute: 'sourceOptions',
				value: stringifyCommaSeparated(props.sourceOptions?.map((o) => stringifyAnySourceRef(o))),
			},
			{ attribute: 'source', value: stringifyAnySourceRef(props.source) },
			// available is read-only
		])
	}

	// INPUTS
	// 	IP<1-48>
	// 	NDI<1-2>
	// 	STREAM<1-6>
	// 	SDI<1-32>
	async getInput(inputRef: AnyInputRef): Promise<InputObject> {
		const obj = await this.#getObject(refToPath(inputRef), InputObjectEncodingDefinition)

		return {
			...obj,
			type: inputRef.realm,
		}
	}
	async updateInput(inputRef: AnyInputRef, props: Partial<UpdateInputObject>): Promise<void> {
		await this.setAttributes(refToPath(inputRef), [
			{ attribute: 'name', value: props.name },
			{
				attribute: 'colorOverwrite',
				value: stringifyBoolean(props.colorOverwrite),
			},
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			// available is read-only
			// recordingStatus is read-only
			// tally is read-only
		])
	}
	async grabInput(inputRef: AnyInputRef): Promise<void> {
		await this.executeFunction(`${refToPath(inputRef)}.grab`)
	}
	async recordInput(inputRef: AnyInputRef): Promise<void> {
		await this.executeFunction(`${refToPath(inputRef)}.record`)
	}
	async stopRecordInput(inputRef: AnyInputRef): Promise<void> {
		await this.executeFunction(`${refToPath(inputRef)}.stop_record`)
	}
	async recordLoopInput(inputRef: AnyInputRef): Promise<void> {
		await this.executeFunction(`${refToPath(inputRef)}.record_loop`)
	}

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
		await this.setAttributes(`GFX${gfxChannelId}`, [
			{ attribute: 'scene', value: stringifyRef<GfxSceneRef>('gfxScene', props.scene) },
		])
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
			{ attribute: 'resolution', value: stringifyEnum<Resolution>(props.resolution, Resolution) },
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
	async listAudioPlayers(): Promise<AudioPlayerRef[]> {
		return omitFalsy(
			(await this.getList('AUDIOPLAYERS')).map((path) => {
				// "AP1"
				if (!path.startsWith('AP')) return undefined
				const playerId = parseInt(path.slice(2), 10)
				return refAudioPlayer(playerId)
			})
		)
	}
	async getAudioPlayer(playerId: number | AudioPlayerRef): Promise<AudioPlayerObject> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.#getObject(refToPath(refAudioPlayer(playerId)), AudioPlayerObjectEncodingDefinition)
	}
	async loadAudioPLayerClip(
		playerId: number | AudioPlayerRef,
		clip: AudioPlayerObject['clip'],
		position?: number
	): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		await this._loadPlayerClip(
			refToPath(refAudioPlayer(playerId)),
			stringifyRef<MediaSoundRef>('media-sound', clip),
			position
		)
	}
	async updateAudioPlayer(playerId: number | AudioPlayerRef, props: Partial<UpdateAudioPlayerObject>): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		await this.setAttributes(refToPath(refAudioPlayer(playerId)), [
			{ attribute: 'clip', value: stringifyRef<MediaSoundRef>('media-sound', props.clip) }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInteger(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyEnum<PlayerTMS>(props.tms, PlayerTMS) },
			{ attribute: 'autoplay', value: stringifyBoolean(props.autoplay) },
			// 'tally' is read-only, so can't be set
		])
	}
	async audioPlayerBegin(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.begin`)
	}
	async audioPlayerRewind(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.rewind`)
	}
	async audioPlayerStepBack(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.step_back`)
	}
	async audioPlayerReverse(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.reverse`)
	}
	async audioPlayerPlay(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.play`)
	}
	async audioPlayerPause(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.pause`)
	}
	async audioPlayerStop(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.stop`)
	}
	async audioPlayerStepForward(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.step_forward`)
	}
	async audioPlayerFastForward(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.fast_forward`)
	}
	async audioPlayerEnd(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.end`)
	}
	async audioPlayerPlaylistBegin(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.playlist_begin`)
	}
	async audioPlayerPlaylistBack(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.playlist_back`)
	}
	async audioPlayerPlaylistNext(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.playlist_next`)
	}
	async audioPlayerPlaylistEnd(playerId: number | AudioPlayerRef): Promise<void> {
		playerId = this._assertAudioPlayerIdIsValid(playerId)
		return this.executeFunction(`${refToPath(refAudioPlayer(playerId))}.playlist_end`)
	}
	private _assertAudioPlayerIdIsValid(playerId: number | AudioPlayerRef): number {
		if (typeof playerId === 'object') {
			if (playerId.realm !== 'audio-player') throw new Error(`Invalid playerId realm: ${playerId.realm}.`)
			playerId = playerId.playerIndex
		}
		this._assertPlayerIdIsValid(playerId)
		return playerId
	}

	// AUDIOMIXERS
	// 	AUDIOMIXER
	async listAudioMixerChannels(): Promise<(AudioMixerChannelRef & { name: string })[]> {
		return (await this._listDeep('AUDIOMIXER')).map((itemPath) => {
			return {
				realm: 'audioMixer-channel',
				name: itemPath[itemPath.length - 1],
				channelPath: itemPath.slice(1), // remove the "AUDIOMIXER" part
			}
		})
	}
	async getAudioMixerMainBus(): Promise<AudioMixerObject> {
		return this.#getObject(`AUDIOMIXER`, AudioMixerObjectEncodingDefinition)
	}
	async updateAudioMixerMainBus(props: Partial<UpdateAudioMixerObject>): Promise<void> {
		await this.setAttributes(`AUDIOMIXER`, [
			{ attribute: 'volume', value: stringifyFloat(props.volume) },
			{ attribute: 'mute', value: stringifyBoolean(props.mute) },
		])
	}
	async getAudioMixerChannel(channelRef: AudioMixerChannelRef): Promise<AudioMixerObject> {
		return this.#getObject(`${refToPath(channelRef)}`, AudioMixerObjectEncodingDefinition)
	}
	async updateAudioMixerChannel(
		channelRef: AudioMixerChannelRef,
		props: Partial<UpdateAudioMixerObject>
	): Promise<void> {
		await this.setAttributes(`${refToPath(channelRef)}`, [
			{ attribute: 'volume', value: stringifyFloat(props.volume) },
			{ attribute: 'mute', value: stringifyBoolean(props.mute) },
		])
	}
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
	async listImageStores(): Promise<ImageStoreRef[]> {
		return omitFalsy(
			(await this.getList('IMAGESTORES')).map((path) => {
				// "IS1"
				if (!path.startsWith('IS')) return undefined
				const playerId = parseInt(path.slice(2), 10)
				return refImageStore(playerId)
			})
		)
	}
	async getImageStore(storeId: number | ImageStoreRef): Promise<ImageStoreObject> {
		storeId = this._assertImageStoreIdIsValid(storeId)
		return this.#getObject(refToPath(refImageStore(storeId)), ImageStoreObjectEncodingDefinition)
	}
	async updateImageStore(storeId: number | ImageStoreRef, props: Partial<UpdateImageStoreObject>): Promise<void> {
		storeId = this._assertImageStoreIdIsValid(storeId)

		await this.setAttributes(refToPath(refImageStore(storeId)), [
			{ attribute: 'clip', value: stringifyImageStoreClip(props.clip) }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'color', value: stringifyColorRGB(props.color) },
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'dissolve_enabled', value: stringifyBoolean(props.dissolveEnabled) },
			{ attribute: 'dissolve_time', value: stringifyInteger(props.dissolveTime) },
			{ attribute: 'dissolve_mode', value: stringifyEnum<DissolveMode>(props.dissolveMode, DissolveMode) },
			{ attribute: 'remove_source_alpha', value: stringifyBoolean(props.removeSourceAlpha) },
			{ attribute: 'scale_mode', value: stringifyEnum<ImageStoreScaleMode>(props.scaleMode, ImageStoreScaleMode) },
			{ attribute: 'resolution', value: stringifyEnum<Resolution>(props.resolution, Resolution) },
			{ attribute: 'advanced_resolution_control', value: stringifyBoolean(props.advancedResolutionControl) },
			{ attribute: 'resolution_x', value: stringifyInteger(props.resolutionX) },
			{ attribute: 'resolution_y', value: stringifyInteger(props.resolutionY) },
			// 'tally' is read-only, so can't be set
		])
	}
	async imageStorePlaylistBegin(storeId: number | ImageStoreRef): Promise<void> {
		storeId = this._assertImageStoreIdIsValid(storeId)
		return this.executeFunction(`${refToPath(refImageStore(storeId))}.playlist_begin`)
	}
	async imageStorePlaylistBack(storeId: number | ImageStoreRef): Promise<void> {
		storeId = this._assertImageStoreIdIsValid(storeId)
		return this.executeFunction(`${refToPath(refImageStore(storeId))}.playlist_back`)
	}
	async imageStorePlaylistNext(storeId: number | ImageStoreRef): Promise<void> {
		storeId = this._assertImageStoreIdIsValid(storeId)
		return this.executeFunction(`${refToPath(refImageStore(storeId))}.playlist_next`)
	}
	async imageStorePlaylistEnd(storeId: number | ImageStoreRef): Promise<void> {
		storeId = this._assertImageStoreIdIsValid(storeId)
		return this.executeFunction(`${refToPath(refImageStore(storeId))}.playlist_end`)
	}
	private _assertImageStoreIdIsValid(playerId: number | ImageStoreRef): number {
		if (typeof playerId === 'object') {
			if (playerId.realm !== 'imageStore') throw new Error(`Invalid playerId realm: ${playerId.realm}.`)
			playerId = playerId.storeIndex
		}
		this._assertPlayerIdIsValid(playerId)
		return playerId
	}

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

	/**
	 * Filter away folders from a list of items
	 */
	private _filterAwayFolders(itemPaths: RefPath[]): RefPath[] {
		// Filter away folders, ie items that have other items "under" them:

		/** Set of ALL paths */
		const pathsSet = new Set<string>()
		for (const p of itemPaths) {
			const dirPath = p.slice(0, -1).join('.') // omit last, making it a dirPath
			pathsSet.add(dirPath)
		}

		return itemPaths.filter((p) => {
			const myPath = p.join('.')
			return !pathsSet.has(myPath) // If myPath exists in the set, it means I'm a folder
		})
	}
	/**
	 * Loads a clip onto a player, and sets the position
	 */
	private async _loadPlayerClip(playerPath: string, clipPath: string, position?: number): Promise<void> {
		// This is a special operation, because loading a clip can take some time and the responses from KAIROS are unreliable during that time.

		if (clipPath === '') {
			// Fast path, unload the clip:
			await this.setAttribute(`${playerPath}.clip`, clipPath)
			return
		}

		// Fast path: Do an initial check if the clip is already loaded
		const currentClip = await this.getAttribute(`${playerPath}.clip`)
		if (currentClip === clipPath) {
			// It looks like the clip is already loaded
			if (position !== undefined) {
				await this.setAttribute(`${playerPath}.position`, `${position}`)
			}
			return
		}

		if (position === undefined) position = 0

		await this.setAttributeAndVerify(
			`${playerPath}.clip`,
			clipPath,
			[
				{
					path: `${playerPath}.position`,
					value: `${position + 1}`,
				},
			],
			5000
		)

		// Set position to the correct one:
		await this.setAttribute(`${playerPath}.position`, `${position}`)
	}
}

// ------------------------ Custom types -------------------------
export type SceneTransition = SceneTransitionRef & { name: string; mixes: SceneTransitionMix[] }
export type SceneTransitionMix = SceneTransitionMixRef & { name: string; effects: SceneTransitionMixEffect[] }
export type SceneTransitionMixEffect = SceneTransitionMixEffectRef & { name: string }
