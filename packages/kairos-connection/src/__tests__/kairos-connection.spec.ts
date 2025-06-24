import { expect, test, describe, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import {
	ClipPlayerObject,
	ClipPlayerTMS,
	KairosConnection,
	MinimalKairosConnection,
	ResponseError,
	SceneLayerActiveBus,
	SceneLayerBlendMode,
	SceneLayerDissolveMode,
	SceneLayerEffectChromaKeyEdgeSmoothingSize,
	SceneLayerEffectChromaKeyObject,
	SceneLayerEffectCropObject,
	SceneLayerEffectLuminanceKeyBlendMode,
	SceneLayerEffectLuminanceKeyObject,
	SceneLayerEffectTransform2DObject,
	SceneLayerEffectTransform2DType,
	SceneLayerMode,
	SceneLayerObject,
	SceneLayerPgmPstMode,
	SceneLayerState,
	SceneLimitOffAction,
	SceneObject,
	SceneResolution,
} from '../main.js'
import { KairosRecorder } from './lib/kairos-recorder.js'
import { refScene, refSceneLayer, refSceneLayerEffect, SceneRef } from '../lib/reference.js'

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
					const orgError = new Error()
					try {
						const replyLines = await this._replyHandler(commandStr)

						if (replyLines.length === 1 && replyLines[0] === 'Error') {
							throw new ResponseError(commandStr, replyLines[0])
						}

						const reply = deserializer(replyLines)
						if (reply === null) throw new Error(`No reply received for command: ${commandStr}`)

						return reply.response as TRes
					} catch (e) {
						if (e instanceof Error) {
							// Append context to error message:
							e.message += ` (in response to ${commandStr} )`

							// Append original call stack to the error:
							const orgStack = `${orgError.stack}`.replace('Error: \n', '')

							if (e.stack) {
								e.stack = `${e.stack}\n--- Original stack: -------------------\n${orgStack}`
							} else {
								e.stack = orgStack
							}
						}
						throw e
					}
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

	let emulatorConnection: KairosRecorder | null

	beforeAll(async () => {
		if (process.env.KAIROS_EMULATOR_IP) {
			emulatorConnection = new KairosRecorder(process.env.KAIROS_EMULATOR_IP)
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

		test('SCENES', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:SCENES': ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', ''],
					'list_ex:SCENES.Main': ['list_ex:SCENES.Main=', 'SCENES.Main.Layers', 'SCENES.Main.Transitions', ''],
					'list_ex:SCENES.Templates': [
						'list_ex:SCENES.Templates=',
						'SCENES.Templates.2Box',
						'SCENES.Templates.4Box',
						'SCENES.Templates.OTS Left',
						'SCENES.Templates.OTS Right',
						'SCENES.Templates.Title',
						'SCENES.Templates.Sidecar',
						'',
					],
					'list_ex:SCENES.Templates.2Box': [
						'list_ex:SCENES.Templates.2Box=',
						'SCENES.Templates.2Box.Layers',
						'SCENES.Templates.2Box.Transitions',
						'',
					],
					'list_ex:SCENES.Templates.4Box': [
						'list_ex:SCENES.Templates.4Box=',
						'SCENES.Templates.4Box.Layers',
						'SCENES.Templates.4Box.Transitions',
						'',
					],
					'list_ex:SCENES.Templates.OTS Left': [
						'list_ex:SCENES.Templates.OTS Left=',
						'SCENES.Templates.OTS Left.Layers',
						'SCENES.Templates.OTS Left.Transitions',
						'',
					],
					'list_ex:SCENES.Templates.OTS Right': [
						'list_ex:SCENES.Templates.OTS Right=',
						'SCENES.Templates.OTS Right.Layers',
						'SCENES.Templates.OTS Right.Transitions',
						'',
					],
					'list_ex:SCENES.Templates.Title': [
						'list_ex:SCENES.Templates.Title=',
						'SCENES.Templates.Title.Layers',
						'SCENES.Templates.Title.Transitions',
						'',
					],
					'list_ex:SCENES.Templates.Sidecar': [
						'list_ex:SCENES.Templates.Sidecar=',
						'SCENES.Templates.Sidecar.Layers',
						'SCENES.Templates.Sidecar.Transitions',
						'',
					],

					'SCENES.Main.advanced_resolution_control=0': ['OK'],
					'SCENES.Main.color=rgb(255,0,0)': ['OK'],
					'SCENES.Main.next_transition=SCENES.Main.Transitions.BgdMix': ['OK'],
					'SCENES.Main.all_duration=20': ['OK'],
					'SCENES.Main.all_fader=0': ['OK'],
					'SCENES.Main.fader_reverse=0': ['OK'],
					'SCENES.Main.fader_sync=0': ['OK'],
					'SCENES.Main.limit_return_time=20': ['OK'],
					'SCENES.Main.advanced_resolution_control': ['SCENES.Main.advanced_resolution_control=0'],
					'SCENES.Main.resolution_x': ['SCENES.Main.resolution_x=1920'],
					'SCENES.Main.resolution_y': ['SCENES.Main.resolution_y=1080'],
					'SCENES.Main.tally': ['SCENES.Main.tally=3'],
					'SCENES.Main.color': ['SCENES.Main.color=rgb(255,0,0)'],
					'SCENES.Main.resolution': ['SCENES.Main.resolution=1920x1080'],
					'SCENES.Main.next_transition': ['SCENES.Main.next_transition=SCENES.Main.Transitions.BgdMix,'],
					'SCENES.Main.all_duration': ['SCENES.Main.all_duration=20'],
					'SCENES.Main.all_fader': ['SCENES.Main.all_fader=0'],
					'SCENES.Main.next_transition_type': ['SCENES.Main.next_transition_type=<unknown>'],
					'SCENES.Main.fader_reverse': ['SCENES.Main.fader_reverse=0'],
					'SCENES.Main.fader_sync': ['SCENES.Main.fader_sync=0'],
					'SCENES.Main.limit_off_action': ['SCENES.Main.limit_off_action=None'],
					'SCENES.Main.limit_return_time': ['SCENES.Main.limit_return_time=20'],
					'SCENES.Main.key_preview': ['SCENES.Main.key_preview=<unknown>'],
					'SCENES.Main.auto=': ['OK'],
					'SCENES.Main.cut=': ['OK'],
					'SCENES.Main.all_selected_auto=': ['OK'],
					'SCENES.Main.all_selected_cut=': ['OK'],
					'SCENES.Main.store_snapshot=': ['OK'],
				}[message]
				if (reply) {
					return reply
				}
				if (emulatorConnection) {
					// If there is an emulatorConnection, use it to handle the command:
					const reply = await emulatorConnection.doCommand(message)
					if (reply !== null) return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			expect(await connection.listScenes(undefined, true)).toStrictEqual([
				{ realm: 'scene', scenePath: ['Main'], name: 'Main' },
				{ realm: 'scene', scenePath: ['Templates'], name: 'Templates' },
				{ realm: 'scene', scenePath: ['Templates', '2Box'], name: '2Box' },
				{ realm: 'scene', scenePath: ['Templates', '4Box'], name: '4Box' },
				{ realm: 'scene', scenePath: ['Templates', 'OTS Left'], name: 'OTS Left' },
				{ realm: 'scene', scenePath: ['Templates', 'OTS Right'], name: 'OTS Right' },
				{ realm: 'scene', scenePath: ['Templates', 'Title'], name: 'Title' },
				{ realm: 'scene', scenePath: ['Templates', 'Sidecar'], name: 'Sidecar' },
			] satisfies (SceneRef & { name: string })[])

			expect(
				await connection.updateScene(refScene(['Main']), {
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

			expect(await connection.getScene(refScene(['Main']))).toStrictEqual({
				advancedResolutionControl: false,
				allDuration: 20,
				allFader: 0,
				color: 'rgb(255,0,0)',
				faderReverse: false,
				faderSync: false,
				keyPreview: '<unknown>',
				limitOffAction: SceneLimitOffAction.None,
				limitReturnTime: 20,
				nextTransition: ['SCENES.Main.Transitions.BgdMix'],
				nextTransitionType: '<unknown>',
				resolution: SceneResolution.Resolution1920x1080,
				resolutionX: 1920,
				resolutionY: 1080,
				tally: 3,
			} satisfies SceneObject)

			expect(await connection.sceneAuto(refScene(['Main']))).toBeUndefined()

			expect(await connection.sceneCut(refScene(['Main']))).toBeUndefined()
			expect(await connection.sceneAllSelectedAuto(refScene(['Main']))).toBeUndefined()
			expect(await connection.sceneAllSelectedCut(refScene(['Main']))).toBeUndefined()
			expect(await connection.sceneStoreSnapshot(refScene(['Main']))).toBeUndefined()
		})
		// SCENES.Scene.Layers
		// 		Layers
		// 			Layer
		test('SCENES.Layers', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:SCENES.Main.Layers': [
						'list_ex:SCENES.Main.Layers=',
						'SCENES.Main.Layers.Background',
						'SCENES.Main.Layers.Layer-1',
						'SCENES.Main.Layers.Layer-2',
						'SCENES.Main.Layers.Group-1',
						'',
					],
					'list_ex:SCENES.Main.Layers.Background': [
						'list_ex:SCENES.Main.Layers.Background=',
						'SCENES.Main.Layers.Background.Effects',
						'',
					],
					'list_ex:SCENES.Main.Layers.Layer-1': [
						'list_ex:SCENES.Main.Layers.Layer-1=',
						'SCENES.Main.Layers.Layer-1.Effects',
						'',
					],
					'list_ex:SCENES.Main.Layers.Layer-2': [
						'list_ex:SCENES.Main.Layers.Layer-2=',
						'SCENES.Main.Layers.Layer-2.Effects',
						'',
					],
					'list_ex:SCENES.Main.Layers.Group-1': [
						'list_ex:SCENES.Main.Layers.Group-1=',
						'SCENES.Main.Layers.Group-1.Effects',
						'SCENES.Main.Layers.Group-1.InnerLayer',
						'',
					],
					'list_ex:SCENES.Main.Layers.Group-1.InnerLayer': [
						'list_ex:SCENES.Main.Layers.Group-1.InnerLayer=',
						'SCENES.Main.Layers.Group-1.InnerLayer.Effects',
						'',
					],

					'SCENES.Main.Layers.Background.color=rgb(255,0,0)': ['OK'],
					'SCENES.Main.Layers.Background.opacity': ['SCENES.Main.Layers.Background.opacity=1'],
					'SCENES.Main.Layers.Background.sourceA': ['SCENES.Main.Layers.Background.sourceA=BLACK'],
					'SCENES.Main.Layers.Background.sourceB': ['SCENES.Main.Layers.Background.sourceB=BLACK'],
					'SCENES.Main.Layers.Background.source_pgm': ['SCENES.Main.Layers.Background.source_pgm=BLACK'],
					'SCENES.Main.Layers.Background.source_pst': ['SCENES.Main.Layers.Background.source_pst=BLACK'],
					'SCENES.Main.Layers.Background.active_bus': ['SCENES.Main.Layers.Background.active_bus=A-Bus'],
					'SCENES.Main.Layers.Background.pgm_pst_mode': ['SCENES.Main.Layers.Background.pgm_pst_mode=Swap'],
					'SCENES.Main.Layers.Background.sourceOptions': [
						'SCENES.Main.Layers.Background.sourceOptions=BLACK,CP1,CP2,RR1,RR2,RR3,RR4,RR5,RR6,RR7,RR8,IS1,IS2,IS3,IS4,IS5,IS6,IS7,IS8,SCENES.Templates.2Box,SCENES.Templates.4Box,SCENES.Templates.OTS Left,SCENES.Templates.OTS Right,SCENES.Templates.Title,SCENES.Templates.Sidecar,',
					],
					'SCENES.Main.Layers.Background.state': ['SCENES.Main.Layers.Background.state=On'],
					'SCENES.Main.Layers.Background.mode': ['SCENES.Main.Layers.Background.mode=Auto'],
					'SCENES.Main.Layers.Background.fxEnabled': ['SCENES.Main.Layers.Background.fxEnabled=0'],
					'SCENES.Main.Layers.Background.preset_enabled': ['SCENES.Main.Layers.Background.preset_enabled=1'],
					'SCENES.Main.Layers.Background.color': ['SCENES.Main.Layers.Background.color=rgb(255,0,0)'],
					'SCENES.Main.Layers.Background.clean_mask': ['SCENES.Main.Layers.Background.clean_mask=0'],
					'SCENES.Main.Layers.Background.dissolve_enabled': ['SCENES.Main.Layers.Background.dissolve_enabled=0'],
					'SCENES.Main.Layers.Background.dissolve_time': ['SCENES.Main.Layers.Background.dissolve_time=50'],
					'SCENES.Main.Layers.Background.source_clean_mask': ['SCENES.Main.Layers.Background.source_clean_mask=0'],
					'SCENES.Main.Layers.Background.dissolve_mode': ['SCENES.Main.Layers.Background.dissolve_mode=Normal'],
					'SCENES.Main.Layers.Background.blend_mode': ['SCENES.Main.Layers.Background.blend_mode=Default'],
					'SCENES.Main.Layers.Background.opacity=1': ['OK'],
					'SCENES.Main.Layers.Background.sourceA=BLACK': ['OK'],
					'SCENES.Main.Layers.Background.source_pgm=BLACK': ['OK'],
					'SCENES.Main.Layers.Background.source_pst=BLACK': ['OK'],
					'SCENES.Main.Layers.Background.sourceOptions=BLACK,CP1,CP2,RR1,RR2,RR3,RR4,RR5,RR6,RR7,RR8,IS1,IS2,IS3,IS4,IS5,IS6,IS7,IS8,SCENES.Templates.2Box,SCENES.Templates.4Box,SCENES.Templates.OTS Left,SCENES.Templates.OTS Right,SCENES.Templates.Title,SCENES.Templates.Sidecar':
						['OK'],
					'SCENES.Main.Layers.Background.preset_enabled=1': ['OK'],
					'SCENES.Main.Layers.Background.clean_mask=0': ['OK'],
					'SCENES.Main.Layers.Background.source_clean_mask=0': ['OK'],
					'SCENES.Main.Layers.Background.dissolve_enabled=0': ['OK'],
					'SCENES.Main.Layers.Background.dissolve_time=50': ['OK'],
					'SCENES.Main.Layers.Background.swap_A_B=': ['OK'],
					'SCENES.Main.Layers.Background.show_layer=': ['OK'],
					'SCENES.Main.Layers.Background.hide_layer=': ['OK'],
					'SCENES.Main.Layers.Background.toggle_layer=': ['OK'],
				}[message]
				if (reply) return reply

				if (emulatorConnection) {
					// If there is an emulatorConnection, use it to handle the command:
					const reply = await emulatorConnection.doCommand(message)
					if (reply !== null) return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			const refMain = refScene(['Main'])
			expect(await connection.listSceneLayers(refSceneLayer(refMain, []), true)).toStrictEqual([
				{
					realm: 'scene-layer',
					name: 'Background',
					scenePath: ['Main'],
					layerPath: ['Background'],
				},
				{
					realm: 'scene-layer',
					name: 'Layer-1',
					scenePath: ['Main'],
					layerPath: ['Layer-1'],
				},
				{
					realm: 'scene-layer',
					name: 'Layer-2',
					scenePath: ['Main'],
					layerPath: ['Layer-2'],
				},
				{
					realm: 'scene-layer',
					name: 'Group-1',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
				},
				{
					realm: 'scene-layer',
					name: 'InnerLayer',
					scenePath: ['Main'],
					layerPath: ['Group-1', 'InnerLayer'],
				},
			])

			expect(
				await connection.updateSceneLayer(refSceneLayer(refMain, ['Background']), {
					// blendMode: NaN,
					cleanMask: 0,
					color: 'rgb(255,0,0)',
					dissolveEnabled: false,
					// dissolveMode: NaN,
					dissolveTime: 50,
					// mode: NaN,
					opacity: 1,
					// pgmPstMode: NaN,
					presetEnabled: true,
					sourceA: 'BLACK',
					sourceCleanMask: 0,
					sourceOptions: [
						'BLACK',
						'CP1',
						'CP2',
						'RR1',
						'RR2',
						'RR3',
						'RR4',
						'RR5',
						'RR6',
						'RR7',
						'RR8',
						'IS1',
						'IS2',
						'IS3',
						'IS4',
						'IS5',
						'IS6',
						'IS7',
						'IS8',
						'SCENES.Templates.2Box',
						'SCENES.Templates.4Box',
						'SCENES.Templates.OTS Left',
						'SCENES.Templates.OTS Right',
						'SCENES.Templates.Title',
						'SCENES.Templates.Sidecar',
					],
					sourcePgm: 'BLACK',
					sourcePst: 'BLACK',
				})
			).toBeUndefined()

			expect(await connection.getSceneLayer(refSceneLayer(refMain, ['Background']))).toStrictEqual({
				activeBus: SceneLayerActiveBus.ABus,
				blendMode: SceneLayerBlendMode.Default,
				cleanMask: 0,
				color: 'rgb(255,0,0)',
				dissolveEnabled: false,
				dissolveMode: SceneLayerDissolveMode.Normal,
				dissolveTime: 50,
				fxEnabled: false,
				mode: SceneLayerMode.Auto,
				opacity: 1,
				pgmPstMode: SceneLayerPgmPstMode.Swap,
				presetEnabled: true,
				sourceA: 'BLACK',
				sourceB: 'BLACK',
				sourceCleanMask: 0,
				sourceOptions: [
					'BLACK',
					'CP1',
					'CP2',
					'RR1',
					'RR2',
					'RR3',
					'RR4',
					'RR5',
					'RR6',
					'RR7',
					'RR8',
					'IS1',
					'IS2',
					'IS3',
					'IS4',
					'IS5',
					'IS6',
					'IS7',
					'IS8',
					'SCENES.Templates.2Box',
					'SCENES.Templates.4Box',
					'SCENES.Templates.OTS Left',
					'SCENES.Templates.OTS Right',
					'SCENES.Templates.Title',
					'SCENES.Templates.Sidecar',
				],
				sourcePgm: 'BLACK',
				sourcePst: 'BLACK',
				state: SceneLayerState.On,
			} satisfies SceneLayerObject)

			expect(await connection.sceneLayerSwapAB(refSceneLayer(refMain, ['Background']))).toBeUndefined()
			expect(await connection.sceneLayerShowLayer(refSceneLayer(refMain, ['Background']))).toBeUndefined()
			expect(await connection.sceneLayerHideLayer(refSceneLayer(refMain, ['Background']))).toBeUndefined()
			expect(await connection.sceneLayerToggleLayer(refSceneLayer(refMain, ['Background']))).toBeUndefined()
		})
		// SCENES.Scene.Layers.Layer
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
		test.only('SCENES.Layers.Effects', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:SCENES.Main.Layers.Group-1.Effects': [
						'list_ex:SCENES.Main.Layers.Group-1.Effects=',
						'SCENES.Main.Layers.Group-1.Effects.Crop',
						'SCENES.Main.Layers.Group-1.Effects.Transform2D',
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey',
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey',
						'SCENES.Main.Layers.Group-1.Effects.YUVCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.RGBCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.LUTCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.VirtualPTZ-1',
						'SCENES.Main.Layers.Group-1.Effects.ToneCurveCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.MatrixCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.TemperatureCorrection-1',
						'SCENES.Main.Layers.Group-1.Effects.LinearKey-1',
						'SCENES.Main.Layers.Group-1.Effects.Position-1',
						'SCENES.Main.Layers.Group-1.Effects.PCrop-1',
						'SCENES.Main.Layers.Group-1.Effects.FilmLook-1',
						'SCENES.Main.Layers.Group-1.Effects.GlowEffect-1',
						'',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.enabled=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.top=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.left=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.right=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.bottom=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.rounded_corners=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.global_softness=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.enabled': ['SCENES.Main.Layers.Group-1.Effects.Crop.enabled=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.top': ['SCENES.Main.Layers.Group-1.Effects.Crop.top=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.left': ['SCENES.Main.Layers.Group-1.Effects.Crop.left=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.right': ['SCENES.Main.Layers.Group-1.Effects.Crop.right=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.bottom': ['SCENES.Main.Layers.Group-1.Effects.Crop.bottom=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness': ['SCENES.Main.Layers.Group-1.Effects.Crop.softness=0'],
					'SCENES.Main.Layers.Group-1.Effects.Crop.rounded_corners': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.rounded_corners=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.global_softness': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.global_softness=1',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness_top': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.softness_top=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness_left': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.softness_left=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness_right': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.softness_right=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Crop.softness_bottom': [
						'SCENES.Main.Layers.Group-1.Effects.Crop.softness_bottom=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.enabled=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.type=2D': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.scale=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_z=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_origin=0/0/0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.position=0/0/0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.cubic_interpolation=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.hide_backside=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_h=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_v=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.enabled': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.enabled=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.type': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.type=2D',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.scale': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.scale=1',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_x': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_x=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_y': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_y=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_z': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_z=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_origin': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.rotation_origin=0/0/0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.position': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.position=0/0/0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.cubic_interpolation': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.cubic_interpolation=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.hide_backside': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.hide_backside=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_h': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_h=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_v': [
						'SCENES.Main.Layers.Group-1.Effects.Transform2D.stretch_v=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.enabled=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.clip=0.5': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.gain=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.cleanup=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.density=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.invert=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.blend_mode=Auto': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.enabled': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.enabled=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.clip': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.clip=0.5',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.gain': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.gain=1',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.cleanup': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.cleanup=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.density': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.density=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.invert': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.invert=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.blend_mode': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.blend_mode=Auto',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.sourceKey': [
						'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.sourceKey=<unknown>',
					],
					'SCENES.Main.Layers.Group-1.Effects.LuminanceKey.auto_adjust=': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.enabled=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.clip=0.5': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.gain=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.cleanup=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.density=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.hue=2.25': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_left=0.3': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_right=0.3': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.luminance=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.chroma=0.2': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.a_chroma=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression=0.3': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_left=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_right=1': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.noise_removal=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.invert=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.fgd_fade=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.auto_state=0': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.edge_smoothing_size=Off': ['OK'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.enabled': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.enabled=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.clip': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.clip=0.5',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.gain': ['SCENES.Main.Layers.Group-1.Effects.ChromaKey.gain=1'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.cleanup': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.cleanup=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.density': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.density=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.hue': ['SCENES.Main.Layers.Group-1.Effects.ChromaKey.hue=2.25'],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_left': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_left=0.3',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_right': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.selectivity_right=0.3',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.luminance': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.luminance=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.chroma': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.chroma=0.2',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.a_chroma': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.a_chroma=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression=0.3',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_left': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_left=1',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_right': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.spill_supression_right=1',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.noise_removal': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.noise_removal=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.invert': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.invert=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.fgd_fade': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.fgd_fade=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.auto_state': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.auto_state=0',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.edge_smoothing_size': [
						'SCENES.Main.Layers.Group-1.Effects.ChromaKey.edge_smoothing_size=Off',
					],
					'SCENES.Main.Layers.Group-1.Effects.ChromaKey.auto_adjust=': ['OK'],
				}[message]
				if (reply) return reply

				if (emulatorConnection) {
					// If there is an emulatorConnection, use it to handle the command:
					const reply = await emulatorConnection.doCommand(message)
					if (reply !== null) return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			const refMain = refScene(['Main'])
			const refBackground = refSceneLayer(refMain, ['Group-1'])

			expect(await connection.listSceneLayerEffects(refBackground)).toStrictEqual([
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['Crop'],
					name: 'Crop',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['Transform2D'],
					name: 'Transform2D',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['LuminanceKey'],
					name: 'LuminanceKey',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['ChromaKey'],
					name: 'ChromaKey',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['YUVCorrection-1'],
					name: 'YUVCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['RGBCorrection-1'],
					name: 'RGBCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['LUTCorrection-1'],
					name: 'LUTCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['VirtualPTZ-1'],
					name: 'VirtualPTZ-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['ToneCurveCorrection-1'],
					name: 'ToneCurveCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['MatrixCorrection-1'],
					name: 'MatrixCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['TemperatureCorrection-1'],
					name: 'TemperatureCorrection-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['LinearKey-1'],
					name: 'LinearKey-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['Position-1'],
					name: 'Position-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['PCrop-1'],
					name: 'PCrop-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['FilmLook-1'],
					name: 'FilmLook-1',
				},
				{
					realm: 'scene-layer-effect',
					scenePath: ['Main'],
					layerPath: ['Group-1'],
					effectPath: ['GlowEffect-1'],
					name: 'GlowEffect-1',
				},
			])

			expect(
				await connection.updateSceneLayerEffectCrop(refSceneLayerEffect(refBackground, ['Crop']), {
					bottom: 0,
					enabled: false,
					globalSoftness: true,
					left: 0,
					right: 0,
					roundedCorners: 0,
					softness: 0,
					top: 0,
					// softnessBottom, softnessLeft, softnessRight, softnessTop are read-only
				})
			).toBeUndefined()
			expect(await connection.getSceneLayerEffectCrop(refSceneLayerEffect(refBackground, ['Crop']))).toStrictEqual({
				bottom: 0,
				enabled: false,
				globalSoftness: true,
				left: 0,
				right: 0,
				roundedCorners: 0,
				softness: 0,
				softnessBottom: 0,
				softnessLeft: 0,
				softnessRight: 0,
				softnessTop: 0,
				top: 0,
			} satisfies SceneLayerEffectCropObject)

			expect(
				await connection.updateSceneLayerEffectTransform2D(refSceneLayerEffect(refBackground, ['Transform2D']), {
					cubicInterpolation: false,
					enabled: false,
					hideBackside: false,
					position: {
						x: 0,
						y: 0,
						z: 0,
					},
					rotationOrigin: {
						x: 0,
						y: 0,
						z: 0,
					},
					// rotationX: 0, // can only be set if type=2.5D
					// rotationY: 0, // can only be set if type=2.5D
					rotationZ: 0,
					scale: 1,
					stretchH: 0,
					stretchV: 0,
					type: SceneLayerEffectTransform2DType.TwoD,
				})
			).toBeUndefined()
			expect(
				await connection.getSceneLayerEffectTransform2D(refSceneLayerEffect(refBackground, ['Transform2D']))
			).toStrictEqual({
				cubicInterpolation: false,
				enabled: false,
				hideBackside: false,
				position: {
					x: 0,
					y: 0,
					z: 0,
				},
				rotationOrigin: {
					x: 0,
					y: 0,
					z: 0,
				},
				rotationX: 0,
				rotationY: 0,
				rotationZ: 0,
				scale: 1,
				stretchH: 0,
				stretchV: 0,
				type: SceneLayerEffectTransform2DType.TwoD,
			} satisfies SceneLayerEffectTransform2DObject)

			expect(
				await connection.updateSceneLayerEffectLuminanceKey(refSceneLayerEffect(refBackground, ['LuminanceKey']), {
					blendMode: SceneLayerEffectLuminanceKeyBlendMode.Auto,
					cleanup: 0,
					clip: 0.5,
					density: 0,
					enabled: false,
					gain: 1,
					invert: false,
					// sourceKey: '<unknown>',
				})
			).toBeUndefined()
			expect(
				await connection.getSceneLayerEffectLuminanceKey(refSceneLayerEffect(refBackground, ['LuminanceKey']))
			).toStrictEqual({
				blendMode: SceneLayerEffectLuminanceKeyBlendMode.Auto,
				cleanup: 0,
				clip: 0.5,
				density: 0,
				enabled: false,
				gain: 1,
				invert: false,
				sourceKey: '<unknown>',
			} satisfies SceneLayerEffectLuminanceKeyObject)

			expect(
				await connection.sceneLayerEffectLuminanceKeyAutoAdjust(refSceneLayerEffect(refBackground, ['LuminanceKey']))
			).toBeUndefined()

			expect(
				await connection.updateSceneLayerEffectChromaKey(refSceneLayerEffect(refBackground, ['ChromaKey']), {
					aChroma: 0,
					autoState: 0,
					chroma: 0.2,
					cleanup: 0,
					clip: 0.5,
					density: 0,
					edgeSmoothingSize: SceneLayerEffectChromaKeyEdgeSmoothingSize.Off,
					enabled: false,
					fgdFade: false,
					gain: 1,
					hue: 2.25,
					invert: false,
					luminance: 0,
					noiseRemoval: 0,
					selectivityLeft: 0.3,
					selectivityRight: 0.3,
					spillSupression: 0.3,
					spillSupressionLeft: 1,
					spillSupressionRight: 1,
				})
			).toBeUndefined()
			expect(
				await connection.getSceneLayerEffectChromaKey(refSceneLayerEffect(refBackground, ['ChromaKey']))
			).toStrictEqual({
				aChroma: 0,
				autoState: 0,
				chroma: 0.2,
				cleanup: 0,
				clip: 0.5,
				density: 0,
				edgeSmoothingSize: SceneLayerEffectChromaKeyEdgeSmoothingSize.Off,
				enabled: false,
				fgdFade: false,
				gain: 1,
				hue: 2.25,
				invert: false,
				luminance: 0,
				noiseRemoval: 0,
				selectivityLeft: 0.3,
				selectivityRight: 0.3,
				spillSupression: 0.3,
				spillSupressionLeft: 1,
				spillSupressionRight: 1,
			} satisfies SceneLayerEffectChromaKeyObject)

			expect(
				await connection.sceneLayerEffectChromaKeyAutoAdjust(refSceneLayerEffect(refBackground, ['ChromaKey']))
			).toBeUndefined()

			// expect(await connection.sceneLayerSwapAB('Main', 'Background')).toBeUndefined()
			// expect(await connection.sceneLayerShowLayer('Main', 'Background')).toBeUndefined()
			// expect(await connection.sceneLayerHideLayer('Main', 'Background')).toBeUndefined()
			// expect(await connection.sceneLayerToggleLayer('Main', 'Background')).toBeUndefined()
		})
		// SCENES.Scene.Layers.Layer
		// 			Transitions
		// 				Transition
		// 				BgdMix
		// 					TransitionEffect
		// SCENES.Scene.Layers.Layer
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
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'RR1.color_overwrite': ['RR1.color_overwrite=0'],
					'RR1.color': ['RR1.color=rgb(255,255,255)'],
					'RR1.timecode': ['RR1.timecode=00:00:00:00'],
					'RR1.remaining_time': ['RR1.remaining_time=00:00:00:00'],
					'RR1.position': ['RR1.position=0'],
					'RR1.repeat': ['RR1.repeat=0'],
					'RR1.tms': ['RR1.tms=Pause'],
					'RR1.clip': ['RR1.clip=<unknown>'],
					'RR1.tally': ['RR1.tally=0'],
					'RR1.autoplay': ['RR1.autoplay=0'],
					'RR1.color_overwrite=0': ['OK'],
					'RR1.color=rgb(255,255,255)': ['OK'],
					'RR1.position=0': ['OK'],
					'RR1.repeat=0': ['OK'],
					'RR1.autoplay=0': ['OK'],
					'RR1.begin=': ['OK'],
					'RR1.rewind=': ['OK'],
					'RR1.step_back=': ['OK'],
					'RR1.reverse=': ['OK'],
					'RR1.play=': ['OK'],
					'RR1.play_loop=': ['OK'],
					'RR1.pause=': ['OK'],
					'RR1.stop=': ['OK'],
					'RR1.step_forward=': ['OK'],
					'RR1.fast_forward=': ['OK'],
					'RR1.end=': ['OK'],
					'RR1.playlist_begin=': ['OK'],
					'RR1.playlist_back=': ['OK'],
					'RR1.playlist_next=': ['OK'],
					'RR1.playlist_end=': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})

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
				tms: ClipPlayerTMS.Pause,
			} satisfies ClipPlayerObject)

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
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'CP1.color_overwrite': ['CP1.color_overwrite=0'],
					'CP1.color': ['CP1.color=rgb(255,255,255)'],
					'CP1.timecode': ['CP1.timecode=00:00:00:00'],
					'CP1.remaining_time': ['CP1.remaining_time=00:00:00:00'],
					'CP1.position': ['CP1.position=0'],
					'CP1.repeat': ['CP1.repeat=0'],
					'CP1.tms': ['CP1.tms=Stop'],
					'CP1.clip': ['CP1.clip=<unknown>'],
					'CP1.tally': ['CP1.tally=0'],
					'CP1.autoplay': ['CP1.autoplay=0'],
					'CP1.color_overwrite=0': ['OK'],
					'CP1.color=rgb(255,255,255)': ['OK'],
					'CP1.position=0': ['OK'],
					'CP1.repeat=0': ['OK'],
					'CP1.tms=NaN': ['Enum Error'],
					'CP1.autoplay=0': ['OK'],
					'CP1.begin=': ['OK'],
					'CP1.rewind=': ['OK'],
					'CP1.step_back=': ['OK'],
					'CP1.reverse=': ['OK'],
					'CP1.play=': ['OK'],
					'CP1.pause=': ['OK'],
					'CP1.stop=': ['OK'],
					'CP1.step_forward=': ['OK'],
					'CP1.fast_forward=': ['OK'],
					'CP1.end=': ['OK'],
					'CP1.playlist_begin=': ['OK'],
					'CP1.playlist_back=': ['OK'],
					'CP1.playlist_next=': ['OK'],
					'CP1.playlist_end=': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})

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
				tms: ClipPlayerTMS.Stop,
			} satisfies ClipPlayerObject)

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
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:MEDIA.clips': ['list_ex:MEDIA.clips=', ''],
					'list_ex:MEDIA.stills': ['list_ex:MEDIA.stills=', ''],
					'list_ex:MEDIA.ramrec': ['list_ex:MEDIA.ramrec=', ''],
					'list_ex:MEDIA.images': ['list_ex:MEDIA.images=', ''],
					'list_ex:MEDIA.sounds': ['list_ex:MEDIA.sounds=', ''],
					'MEDIA.clips.nonexistent.name': ['Error'],
					'MEDIA.clips.nonexistent.status': ['Error'],
					'MEDIA.clips.nonexistent.load_progress': ['Error'],
					'MEDIA.stills.nonexistent.name': ['Error'],
					'MEDIA.stills.nonexistent.status': ['Error'],
					'MEDIA.stills.nonexistent.load_progress': ['Error'],
					'MEDIA.ramrec.nonexistent.name': ['Error'],
					'MEDIA.ramrec.nonexistent.status': ['Error'],
					'MEDIA.ramrec.nonexistent.load_progress': ['Error'],
					'MEDIA.images.nonexistent.name': ['Error'],
					'MEDIA.images.nonexistent.status': ['Error'],
					'MEDIA.images.nonexistent.load_progress': ['Error'],
					'MEDIA.sounds.nonexistent.name': ['Error'],
				}[message]
				if (reply) {
					return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			expect(await connection.listMediaClips()).toStrictEqual([])
			expect(await connection.getMediaClip('nonexistent')).toBeUndefined()
			expect(await connection.listMediaStills()).toStrictEqual([])
			expect(await connection.getMediaStill('nonexistent')).toBeUndefined()
			expect(await connection.listMediaRamRec()).toStrictEqual([])
			expect(await connection.getMediaRamRec('nonexistent')).toBeUndefined()
			expect(await connection.listMediaImage()).toStrictEqual([])
			expect(await connection.getMediaImage('nonexistent')).toBeUndefined()
			expect(await connection.listMediaSounds()).toStrictEqual([])
			expect(await connection.getMediaSound('nonexistent')).toBeUndefined()
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
