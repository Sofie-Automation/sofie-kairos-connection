import {
	parseBoolean,
	parseCommaSeparated,
	stringifyBoolean,
	stringifyCommaSeparated,
	stringifyFloat,
	stringifyInt,
} from './lib/data-parsers.js'
import { MinimalKairosConnection } from './minimal/kairos-minimal.js'
import type {
	MediaObject,
	UpdateSceneObject,
	SceneObject,
	ClipPlayerObject,
	UpdateClipPlayerObject,
} from './kairos-types.js'
import { ResponseError } from './minimal/errors.js'

export class KairosConnection extends MinimalKairosConnection {
	// async updateLayer(params: UpdateLayerCommandParameters): Promise<APIRequest<Commands.UpdateLayer>> {
	// 	// return this.executeCommand({
	// 	// 	command: Commands.UpdateLayer,
	// 	// 	params,
	// 	// })
	// }

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
	// 		Layers
	// 			Layer
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
	// 			Transitions
	// 				Transition
	// 				BgdMix
	// 					TransitionEffect
	// 			Snapshots
	// 				SNP
	async listScenes(): Promise<string[]> {
		return this.getList('SCENES')
	}
	async getScene(sceneName: string): Promise<SceneObject> {
		const values = await this.getAttributes(`SCENES.${sceneName}`, [
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
			resolutionX: parseInt(values.resolution_x, 10),
			resolutionY: parseInt(values.resolution_y, 10),
			tally: parseInt(values.tally, 10),
			color: values.color,
			resolution: parseInt(values.resolution, 10),
			nextTransition: parseCommaSeparated(values.next_transition),
			allDuration: parseInt(values.all_duration, 10),
			allFader: parseFloat(values.all_fader),
			nextTransitionType: values.next_transition_type,
			faderReverse: parseBoolean(values.fader_reverse),
			faderSync: parseBoolean(values.fader_sync),
			limitOffAction: parseInt(values.limit_off_action, 10),
			limitReturnTime: parseInt(values.limit_return_time),
			keyPreview: values.key_preview,
		}
	}
	async updateScene(sceneName: string, props: Partial<UpdateSceneObject>): Promise<void> {
		await this.setAttributes(`SCENES.${sceneName}`, [
			{ attribute: 'advanced_resolution_control', value: stringifyBoolean(props.advancedResolutionControl) },
			// { attribute: 'resolution_x', value: props.resolutionX,
			// { attribute: 'resolution_y', value: props.resolutionY,
			// { attribute: 'tally', value: props.tally,
			{ attribute: 'color', value: props.color },
			{ attribute: 'resolution', value: stringifyInt(props.resolution) },
			{ attribute: 'next_transition', value: stringifyCommaSeparated(props.nextTransition) },
			{ attribute: 'all_duration', value: stringifyInt(props.allDuration) },
			{ attribute: 'all_fader', value: stringifyFloat(props.allFader) },
			{ attribute: 'next_transition_type', value: props.nextTransitionType },
			{ attribute: 'fader_reverse', value: stringifyBoolean(props.faderReverse) },
			{ attribute: 'fader_sync', value: stringifyBoolean(props.faderSync) },
			{ attribute: 'limit_off_action', value: stringifyInt(props.limitOffAction) },
			{ attribute: 'limit_return_time', value: stringifyInt(props.limitReturnTime) },
			{ attribute: 'key_preview', value: props.keyPreview },
		])
	}
	async sceneAuto(sceneName: string): Promise<void> {
		return this.executeFunction(`SCENES.${sceneName}.auto`)
	}
	async sceneCut(sceneName: string): Promise<void> {
		return this.executeFunction(`SCENES.${sceneName}.cut`)
	}
	async sceneAllSelectedAuto(sceneName: string): Promise<void> {
		return this.executeFunction(`SCENES.${sceneName}.all_selected_auto`)
	}
	async sceneAllSelectedCut(sceneName: string): Promise<void> {
		return this.executeFunction(`SCENES.${sceneName}.all_selected_cut`)
	}
	// omitting, strore_snapshot, it must be a typo, right?
	async sceneStoreSnapshot(sceneName: string): Promise<void> {
		return this.executeFunction(`SCENES.${sceneName}.store_snapshot`)
	}

	// Scene.Layers
	// SOURCES
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
			color: values.color,
			timecode: values.timecode,
			remainingTime: values.remaining_time,
			position: parseInt(values.position, 10),
			repeat: parseBoolean(values.repeat),
			tms: parseInt(values.tms, 10),
			clip: values.clip,
			tally: parseInt(values.tally, 10),
			autoplay: parseBoolean(values.autoplay),
		}
	}
	async updateRamRecorder(ramRecorderId: number, props: Partial<UpdateClipPlayerObject>): Promise<void> {
		this._assertRamRecorderIdIsValid(ramRecorderId)
		await this.setAttributes(`RR${ramRecorderId}`, [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: props.color },
			{ attribute: 'clip', value: props.clip }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInt(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyInt(props.tms) },
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
			color: values.color,
			timecode: values.timecode,
			remainingTime: values.remaining_time,
			position: parseInt(values.position, 10),
			repeat: parseBoolean(values.repeat),
			tms: parseInt(values.tms, 10),
			clip: values.clip,
			tally: parseInt(values.tally, 10),
			autoplay: parseBoolean(values.autoplay),
		}
	}
	async updateClipPlayer(playerId: number, props: Partial<UpdateClipPlayerObject>): Promise<void> {
		this._assertPlayerIdIsValid(playerId)
		await this.setAttributes(`CP${playerId}`, [
			{ attribute: 'color_overwrite', value: stringifyBoolean(props.colorOverwrite) },
			{ attribute: 'color', value: props.color },
			{ attribute: 'clip', value: props.clip }, // Note: this needs to be before the other attributes, to ensure they affect the correct clip
			{ attribute: 'timecode', value: props.timecode },
			{ attribute: 'remaining_time', value: props.remainingTime },
			{ attribute: 'position', value: stringifyInt(props.position) },
			{ attribute: 'repeat', value: stringifyBoolean(props.repeat) },
			{ attribute: 'tms', value: stringifyInt(props.tms) },
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
		return this.getList('MEDIA.clips')
	}
	async getMediaClip(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.clips`, name)
	}
	async listMediaStills(): Promise<string[]> {
		return this.getList('MEDIA.stills')
	}
	async getMediaStill(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.stills`, name)
	}
	async listMediaRamRec(): Promise<string[]> {
		return this.getList('MEDIA.ramrec')
	}
	async getMediaRamRec(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.ramrec`, name)
	}
	async listMediaImage(): Promise<string[]> {
		return this.getList('MEDIA.images')
	}
	async getMediaImage(name: string): Promise<MediaObject | undefined> {
		return this._getMediaObject(`MEDIA.images`, name)
	}
	async listMediaSounds(): Promise<string[]> {
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
				status: parseInt(values.status, 10),
				loadProgress: parseFloat(values.load_progress),
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
}

// export interface UpdateLayerCommandParameters<SceneName extends string, LayerName extends string> {
// 	sceneName: SceneName
// 	layerName: LayerName
// 	props: Partial<{
// 		source: string
// 		sdfsd: number
// 		adf: boolean
// 	}>
// }
