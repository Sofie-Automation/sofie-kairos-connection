import { expect, test, describe, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { KairosConnection, MinimalKairosConnection } from '../main.js'
import { KairosRecorder } from './lib/kairos-recorder.js'

// Mock the MinimalKairosConnection class
vi.mock(import('../minimal/kairos-minimal.js'), async (original) => {
	const org = await original()
	return {
		...org,
		MinimalKairosConnection: MockMinimalKairosConnection.getClass(org.MinimalKairosConnection),
		OriginalMinimalKairosConnection: org.MinimalKairosConnection,
	}
})
const MockMinimalKairosConnection = vi.hoisted(() => {
	const connections: Array<MinimalKairosConnection> = []

	return {
		mockConnections(): MinimalKairosConnection[] {
			return connections
		},

		clearMockConnections(): void {
			connections.splice(0, connections.length)
		},
		getClass: (originalClass: typeof MinimalKairosConnection) => {
			// This uses extends the original class, and replaces some of the
			class MockKairosMinimalConnectionInstance extends originalClass implements IMockMinimalKairosConnection {
				private _mockConnected = false
				private _replyHandler: (message: string) => Promise<string[]> = () => {
					throw new Error('No reply handler set')
				}

				public isAMock = true

				get connected(): boolean {
					return this._mockConnected
				}

				connect(_host?: string, _port?: number): void {
					this._mockConnected = true
				}

				disconnect(): void {
					this._mockConnected = false
				}
				discard(): void {
					this._mockConnected = false
				}
				async executeCommand<TRes>(
					commandStr: string,
					deserializer: Parameters<InstanceType<typeof KairosConnection>['executeCommand']>[1]
				): Promise<TRes> {
					const lines = await this._replyHandler(commandStr)

					const reply = deserializer(lines)
					if (reply === null) throw new Error(`No reply received for command: ${commandStr}`)

					return reply.response as TRes
				}

				// ------------ Mock methods --------------------------------------------------------------------------

				public mockSetReplyHandler(handler: (message: string) => Promise<string[]>) {
					this._replyHandler = handler
				}
			}
			return MockKairosMinimalConnectionInstance
		},
	}
})
interface IMockMinimalKairosConnection extends MinimalKairosConnection {
	isAMock: boolean

	mockSetReplyHandler: (handler: (message: string) => Promise<string[]>) => void
}

type MockedKairosConnection = IMockMinimalKairosConnection & InstanceType<typeof KairosConnection>

describe('KairosConnection', () => {
	let connection: MockedKairosConnection

	const useEmulator =
		process.env.KAIROS_CONNECTION_USE_EMULATOR === 'true' || process.env.KAIROS_CONNECTION_USE_EMULATOR === '1'
	let emulatorConnection: KairosRecorder | null

	beforeAll(async () => {
		if (useEmulator) {
			emulatorConnection = new KairosRecorder()
			await emulatorConnection.init()
		}
	})

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()

		MockMinimalKairosConnection.clearMockConnections()
	})

	afterEach(() => {
		if (connection) {
			connection.discard()
		}
		vi.clearAllTimers()
		vi.useRealTimers()
	})
	afterAll(async () => {
		if (emulatorConnection) await emulatorConnection.storeChanges()
	})

	describe('constructor', () => {
		test('should create with custom options', () => {
			connection = new KairosConnection() as unknown as MockedKairosConnection

			// Just check that the KairosMinimalConnection was created
			expect(connection.host).toBe('127.0.0.1')
			expect(connection.port).toBe(3005)

			expect(connection.isAMock).toBe(true)
		})
	})

	describe('commands', () => {
		beforeEach(() => {
			connection = new KairosConnection() as unknown as MockedKairosConnection

			// Set up a default reply handler for the connection
			// That uses the stored responses from the Kairos emulator:
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				if (emulatorConnection) {
					// If there is an emulatorConnection, use it to handle the command:
					const reply = await emulatorConnection.doCommand(message)
					if (reply !== null) return reply
				}
				throw new Error(`Unexpected message: ${message}`)
			})
		})

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

		test('SCENES commands', async () => {
			// connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
			// 	// if (message === 'list_ex:SCENES') {
			// 	// 	return ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', '']
			// 	// }
			// 	throw new Error(`Unexpected message: ${message}`)
			// })

			expect(await connection.listScenes()).toStrictEqual(['SCENES.Main', 'SCENES.Templates'])

			expect(
				await connection.updateScene('Main', {
					advancedResolutionControl: false,
					allDuration: 20,
					allFader: 0,
					color: 'rgb(255,0,0)',
					faderReverse: false,
					faderSync: false,
					// keyPreview: '<unknown>',
					// limitOffAction: NaN,
					limitReturnTime: 20,
					nextTransition: ['SCENES.Main.Transitions.BgdMix'],
					// nextTransitionType: '<unknown>',
				})
			).toBeUndefined()

			expect(await connection.getScene('Main')).toStrictEqual({
				advancedResolutionControl: false,
				allDuration: 20,
				allFader: 0,
				color: 'rgb(255,0,0)',
				faderReverse: false,
				faderSync: false,
				keyPreview: '<unknown>',
				limitOffAction: NaN,
				limitReturnTime: 20,
				nextTransition: ['SCENES.Main.Transitions.BgdMix'],
				nextTransitionType: '<unknown>',
				resolution: 1920,
				resolutionX: 1920,
				resolutionY: 1080,
				tally: 3,
			})

			expect(await connection.sceneAuto('Main')).toBeUndefined()

			expect(await connection.sceneCut('Main')).toBeUndefined()
			expect(await connection.sceneAllSelectedAuto('Main')).toBeUndefined()
			expect(await connection.sceneAllSelectedCut('Main')).toBeUndefined()
			expect(await connection.sceneStoreSnapshot('Main')).toBeUndefined()
		})
		// SCENES.Scene.Layers
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
		test('RAMRECORDERS commands', async () => {
			// connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
			// 	// if (message === 'list_ex:SCENES') {
			// 	// 	return ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', '']
			// 	// }
			// 	throw new Error(`Unexpected message: ${message}`)
			// })

			expect(
				await connection.updateRamRecorder(1, {
					autoplay: false,
					color: 'rgb(255,255,255)',
					colorOverwrite: false,
					position: 0,
					// remainingTime: '00:00:00:00',
					repeat: false,
					// timecode: '00:00:00:00',
				})
			).toBeUndefined()
			expect(await connection.getRamRecorder(1)).toStrictEqual({
				autoplay: false,
				clip: '<unknown>',
				color: 'rgb(255,255,255)',
				colorOverwrite: false,
				position: 0,
				remainingTime: '00:00:00:00',
				repeat: false,
				tally: 0,
				timecode: '00:00:00:00',
				tms: NaN,
			})

			expect(await connection.ramRecorderBegin(1)).toBeUndefined()
			expect(await connection.ramRecorderRewind(1)).toBeUndefined()
			expect(await connection.ramRecorderStepBack(1)).toBeUndefined()
			expect(await connection.ramRecorderReverse(1)).toBeUndefined()
			expect(await connection.ramRecorderPlay(1)).toBeUndefined()
			expect(await connection.ramRecorderPlayLoop(1)).toBeUndefined()
			expect(await connection.ramRecorderPause(1)).toBeUndefined()
			expect(await connection.ramRecorderStop(1)).toBeUndefined()
			expect(await connection.ramRecorderStepForward(1)).toBeUndefined()
			expect(await connection.ramRecorderFastForward(1)).toBeUndefined()
			expect(await connection.ramRecorderEnd(1)).toBeUndefined()
			expect(await connection.ramRecorderPlaylistBegin(1)).toBeUndefined()
			expect(await connection.ramRecorderPlaylistBack(1)).toBeUndefined()
			expect(await connection.ramRecorderPlaylistNext(1)).toBeUndefined()
			expect(await connection.ramRecorderPlaylistEnd(1)).toBeUndefined()
		})
		// PLAYERS
		// 	CP<1-2>
		test('PLAYERS commands', async () => {
			// connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
			// 	// if (message === 'list_ex:SCENES') {
			// 	// 	return ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', '']
			// 	// }
			// 	throw new Error(`Unexpected message: ${message}`)
			// })

			expect(
				await connection.updateClipPlayer(1, {
					autoplay: false,
					// clip: '<unknown>',
					color: 'rgb(255,255,255)',
					colorOverwrite: false,
					position: 0,
					// remainingTime: '00:00:00:00',
					repeat: false,
					// timecode: '00:00:00:00',
					// tms: NaN,
				})
			).toBeUndefined()
			expect(await connection.getClipPlayer(1)).toStrictEqual({
				autoplay: false,
				clip: '<unknown>',
				color: 'rgb(255,255,255)',
				colorOverwrite: false,
				position: 0,
				remainingTime: '00:00:00:00',
				repeat: false,
				tally: 0,
				timecode: '00:00:00:00',
				tms: NaN,
			})

			expect(await connection.clipPlayerBegin(1)).toBeUndefined()
			expect(await connection.clipPlayerRewind(1)).toBeUndefined()
			expect(await connection.clipPlayerStepBack(1)).toBeUndefined()
			expect(await connection.clipPlayerReverse(1)).toBeUndefined()
			expect(await connection.clipPlayerPlay(1)).toBeUndefined()
			expect(await connection.clipPlayerPause(1)).toBeUndefined()
			expect(await connection.clipPlayerStop(1)).toBeUndefined()
			expect(await connection.clipPlayerStepForward(1)).toBeUndefined()
			expect(await connection.clipPlayerFastForward(1)).toBeUndefined()
			expect(await connection.clipPlayerEnd(1)).toBeUndefined()
			expect(await connection.clipPlayerPlaylistBegin(1)).toBeUndefined()
			expect(await connection.clipPlayerPlaylistBack(1)).toBeUndefined()
			expect(await connection.clipPlayerPlaylistNext(1)).toBeUndefined()
			expect(await connection.clipPlayerPlaylistEnd(1)).toBeUndefined()
		})

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

		test('MEDIA commands', async () => {
			// connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
			// 	// if (message === 'list_ex:SCENES') {
			// 	// 	return ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', '']
			// 	// }
			// 	throw new Error(`Unexpected message: ${message}`)
			// })

			// expect(await connection.listMediaClips()).toStrictEqual([])
			expect(await connection.getMediaClip('nonexistent')).toBeUndefined()
			// expect(await connection.listMediaStills()).toStrictEqual([])
			// expect(await connection.getMediaStill('nonexistent')).toBeUndefined()
			// expect(await connection.listMediaRamRec()).toStrictEqual([])
			// expect(await connection.getMediaRamRec('nonexistent')).toBeUndefined()
			// expect(await connection.listMediaImage()).toStrictEqual([])
			// expect(await connection.getMediaImage('nonexistent')).toBeUndefined()
			// expect(await connection.listMediaSounds()).toStrictEqual([])
			// expect(await connection.getMediaSound('nonexistent')).toBeUndefined()
		})

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
	})
})
