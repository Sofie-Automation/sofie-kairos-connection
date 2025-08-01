import { expect, test, describe, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import {
	ClipPlayerObject,
	ClipPlayerTMS,
	KairosConnection,
	MacroObject,
	MacroStatus,
	MinimalKairosConnection,
	ResponseError,
	SceneLayerActiveBus,
	SceneLayerBlendMode,
	SceneLayerDissolveMode,
	SceneLayerEffectChromaKeyEdgeSmoothingSize,
	SceneLayerEffectChromaKeyObject,
	SceneLayerEffectCropObject,
	SceneLayerEffectFilmLookColorMode,
	SceneLayerEffectFilmLookObject,
	SceneLayerEffectGlowEffectObject,
	SceneLayerEffectLinearKeyBlendMode,
	SceneLayerEffectLinearKeyObject,
	SceneLayerEffectLuminanceKeyBlendMode,
	SceneLayerEffectLuminanceKeyObject,
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
	SceneLayerEffectTransform2DObject,
	SceneLayerEffectTransform2DType,
	SceneLayerEffectVirtualPTZObject,
	SceneLayerEffectYUVCorrectionObject,
	SceneLayerMode,
	SceneLayerObject,
	SceneLayerPgmPstMode,
	SceneLayerState,
	SceneLimitOffAction,
	SceneObject,
	SceneResolution,
	SceneCurve,
	SceneSnapshotObject,
	SceneSnapshotPriorityRecall,
	SceneSnapshotStatus,
	SceneTransition,
	SceneTransitionObject,
	SceneTransitionMixEffectObject,
	GfxChannelObject,
	GfxSceneItemObject,
	GfxSceneHTMLElementItemObject,
	GfxSceneObject,
	SubscriptionCallback,
} from '../main.js'
import { KairosRecorder } from './lib/kairos-recorder.js'
import { parseResponseForCommand, ExpectedResponseType } from '../minimal/parser.js'
import {
	GfxSceneRef,
	refClipPlayer,
	refGfxScene,
	refGfxSceneItem,
	refImageStore,
	refMacro,
	refRamRecorder,
	refScene,
	refSceneLayer,
	refSceneLayerEffect,
	refSceneSnapshot,
	refSceneTransition,
	refSceneTransitionMix,
	refSceneTransitionMixEffect,
	refSourceBase,
	SceneRef,
} from '../lib/reference.js'

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
				private _mockSubscribeValue: (
					path: string,
					abort: AbortSignal,
					callback: SubscriptionCallback<string>,
					fetchCurrentValue: boolean
				) => void = () => {
					throw new Error('No subscribe handler set')
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
					expectedResponse: ExpectedResponseType,
					expectedResponsePath: string | null
				): Promise<TRes> {
					const orgError = new Error()
					try {
						const replyLines = await this._replyHandler(commandStr)

						if (replyLines.length === 1 && replyLines[0] === 'Error') {
							throw new ResponseError(commandStr, replyLines[0])
						}

						const response = parseResponseForCommand(replyLines, {
							serializedCommand: commandStr,
							expectedResponse,
							expectedResponsePath,
						})
						if (response.remainingLines.length > 0) {
							throw new Error('Mock error: Unexpected remaining lines: ' + response.remainingLines.join(', '))
						}
						if (response.connectionError) {
							this.emit('error', response.connectionError)
						}

						if (!response.commandResponse) {
							throw new Error(`No reply received for command: ${commandStr}`)
						}
						if (response.commandResponse.type === 'error') {
							throw response.commandResponse.error
						} else {
							return response.commandResponse.value as TRes
						}
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

				public mockSetSubscribeValue(
					handler: (path: string, abort: AbortSignal, callback: SubscriptionCallback<string>) => void
				) {
					this._mockSubscribeValue = handler
				}

				// Override subscribeValue to use mock if set
				subscribeValue(
					path: string,
					abort: AbortSignal,
					callback: SubscriptionCallback<string>,
					fetchCurrentValue = true
				): void {
					this._mockSubscribeValue(path, abort, callback, fetchCurrentValue)
				}
			}
			return MockKairosMinimalConnectionInstance
		},
	}
})
interface IMockMinimalKairosConnection extends MinimalKairosConnection {
	isAMock: boolean

	mockSetReplyHandler: (handler: (message: string) => Promise<string[]>) => void
	mockSetSubscribeValue: (handler: (path: string, abort: AbortSignal, callback: any) => void) => void
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

	describe('generic #subscribeObject', () => {
		// These tests are using `subscribeSceneLayer` as a sample for testing the internal method, but are generic enough to apply to any of the subscriptions

		const refMain = refScene(['Main'])
		const testLayerRef = refSceneLayer(refMain, ['Background'])
		const testLayerPath = 'SCENES.Main.Layers.Background'

		test('should handle subscription error and call callback with error', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			// Mock subscribeValue to simulate an error on the first subscription
			let subscriptionCount = 0
			connection.mockSetSubscribeValue((path: string, _abort: AbortSignal, callback: any) => {
				subscriptionCount++
				if (subscriptionCount === 1) {
					// Simulate error on first subscription
					setTimeout(() => {
						callback(path, new Error('Subscription failed'), null)
					}, 0)
				}
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Process async operations
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with error
			expect(mockCallback).toHaveBeenCalledWith(expect.any(Error), null)
			expect(mockCallback).toHaveBeenCalledTimes(1)
			expect(mockCallback.mock.calls[0][0].message).toContain('Subscription failed')
		})

		test('should handle subscription abort signal', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			// Track subscriptions
			const subscriptions = new Map<string, AbortSignal>()

			// Mock subscribeValue to track abort signals
			connection.mockSetSubscribeValue((path: string, abort: AbortSignal, callback: any) => {
				subscriptions.set(path, abort)

				// Simulate delayed response
				setTimeout(() => {
					if (!abort.aborted) {
						callback(path, null, 'somevalue')
					}
				}, 100)
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Abort before completion
			abortController.abort()

			// Process async operations
			await vi.runOnlyPendingTimersAsync()

			// Callback should not be called after abort
			expect(mockCallback).not.toHaveBeenCalled()

			// Verify that all subscription abort signals are aborted
			for (const [, signal] of subscriptions) {
				expect(signal.aborted).toBe(true)
			}
		})

		test('should handle updates to subscribed attributes', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			// Track callbacks for each subscription
			const callbacks = new Map<string, (path: string, error: Error | null, value: string | null) => void>()

			// Mock subscribeValue with initial values
			connection.mockSetSubscribeValue((path: string, _abort: AbortSignal, callback: any) => {
				callbacks.set(path, callback)

				// Provide initial values for all attributes
				setTimeout(() => {
					const initialValues: Record<string, string> = {
						[`${testLayerPath}.opacity`]: '1.0',
						[`${testLayerPath}.sourceA`]: 'BLACK',
						[`${testLayerPath}.sourceB`]: 'BLACK',
						[`${testLayerPath}.source_pgm`]: 'BLACK',
						[`${testLayerPath}.source_pst`]: 'BLACK',
						[`${testLayerPath}.active_bus`]: 'A-Bus',
						[`${testLayerPath}.pgm_pst_mode`]: 'Swap',
						[`${testLayerPath}.sourceOptions`]: 'BLACK',
						[`${testLayerPath}.state`]: 'Off',
						[`${testLayerPath}.mode`]: 'FitScene',
						[`${testLayerPath}.fxEnabled`]: '0',
						[`${testLayerPath}.preset_enabled`]: '0',
						[`${testLayerPath}.color`]: 'rgb(0,0,0)',
						[`${testLayerPath}.clean_mask`]: '0',
						[`${testLayerPath}.source_clean_mask`]: '0',
						[`${testLayerPath}.dissolve_enabled`]: '0',
						[`${testLayerPath}.dissolve_time`]: '500',
						[`${testLayerPath}.dissolve_mode`]: 'Normal',
						[`${testLayerPath}.blend_mode`]: 'Normal',
					}

					const value = initialValues[path]
					if (value !== undefined) {
						callback(path, null, value)
					}
				}, 0)
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Process initial subscriptions
			await vi.runOnlyPendingTimersAsync()

			// Should have initial callback
			expect(mockCallback).toHaveBeenCalledTimes(1)
			expect(mockCallback.mock.calls[0][1]).toMatchObject({
				opacity: 1.0,
				sourceA: refSourceBase(['BLACK']),
				state: SceneLayerState.Off,
			})

			// Clear mock calls
			mockCallback.mockClear()

			// Simulate an update to opacity
			const opacityCallback = callbacks.get(`${testLayerPath}.opacity`)
			if (opacityCallback) {
				opacityCallback(`${testLayerPath}.opacity`, null, '0.5')
			}

			// Process the update
			await vi.runOnlyPendingTimersAsync()

			// Should have received updated callback
			expect(mockCallback).toHaveBeenCalledTimes(1)
			expect(mockCallback.mock.calls[0][1]).toMatchObject({
				opacity: 0.5, // Updated value
				sourceA: refSourceBase(['BLACK']), // Unchanged value
			})
		})

		test('should handle parser exceptions properly', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			// Mock subscribeValue to provide invalid data that will cause parser to throw
			connection.mockSetSubscribeValue((path: string, _abort: AbortSignal, callback: any) => {
				setTimeout(() => {
					// Provide invalid data for opacity parser (expects number, give invalid string)
					if (path === `${testLayerPath}.opacity`) {
						callback(path, null, 'invalid_number_format')
					} else {
						// Provide normal values for other attributes to ensure they get processed first
						const responses: Record<string, string> = {
							[`${testLayerPath}.sourceA`]: 'BLACK',
							[`${testLayerPath}.sourceB`]: 'WHITE',
							[`${testLayerPath}.source_pgm`]: 'BLACK',
							[`${testLayerPath}.source_pst`]: 'WHITE',
							[`${testLayerPath}.active_bus`]: 'A-Bus',
							[`${testLayerPath}.pgm_pst_mode`]: 'Swap',
							[`${testLayerPath}.sourceOptions`]: 'BLACK,CP1,CP2',
							[`${testLayerPath}.state`]: 'On',
							[`${testLayerPath}.mode`]: 'FitScene',
							[`${testLayerPath}.fxEnabled`]: '1',
							[`${testLayerPath}.preset_enabled`]: '1',
							[`${testLayerPath}.color`]: 'rgb(255,128,64)',
							[`${testLayerPath}.clean_mask`]: '1',
							[`${testLayerPath}.source_clean_mask`]: '2',
							[`${testLayerPath}.dissolve_enabled`]: '0',
							[`${testLayerPath}.dissolve_time`]: '1000',
							[`${testLayerPath}.dissolve_mode`]: 'Normal',
							[`${testLayerPath}.blend_mode`]: 'Normal',
						}

						const value = responses[path]
						if (value !== undefined) {
							callback(path, null, value)
						}
					}
				}, 0)
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Process async operations
			await vi.runOnlyPendingTimersAsync()

			// Should call callback with error due to parsing failure
			expect(mockCallback).toHaveBeenCalledTimes(1)
			const [error, value] = mockCallback.mock.calls[0]
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toMatch(/Failed to parse|invalid_number_format|NaN/)
			expect(value).toBeNull()
		})

		test('should not leak subscriptions when aborted early', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			let subscriptionCount = 0
			const subscriptions = new Set<string>()

			// Mock subscribeValue to track subscriptions and abort early
			connection.mockSetSubscribeValue((path: string, abort: AbortSignal, callback: any) => {
				subscriptionCount++
				subscriptions.add(path)

				// Abort after a few subscriptions
				if (subscriptionCount === 3) {
					abortController.abort()
				}

				// Check if abort happened before callback
				if (!abort.aborted) {
					setTimeout(() => {
						if (!abort.aborted) {
							callback(path, null, 'value')
						}
					}, 0)
				}
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Process subscriptions
			await vi.runOnlyPendingTimersAsync()

			// Should not call callback when aborted during setup
			expect(mockCallback).not.toHaveBeenCalled()
			expect(subscriptionCount).toBeGreaterThan(0)
			// Should should only have been created up to the abort point
			expect(subscriptionCount).toEqual(3)
		})
	})

	describe('commands', () => {
		const refMain = refScene(['Main'])
		const refBackground = refSceneLayer(refMain, ['Group.1'])

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
					'list_ex:SCENES': ['list_ex:SCENES=', 'SCENES.Main', 'SCENES.Templates', 'SCENES.Folder&#46;1', ''],
					'list_ex:SCENES.Main': [
						'list_ex:SCENES.Main=',
						'SCENES.Main.Layers',
						'SCENES.Main.Transitions',
						'SCENES.Main.Snapshots',
						'',
					],
					'list_ex:SCENES.Templates': [
						'list_ex:SCENES.Templates=',
						'SCENES.Templates.2Box',
						'SCENES.Templates.4Box&#46;1',
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
					'list_ex:SCENES.Templates.4Box&#46;1': [
						'list_ex:SCENES.Templates.4Box&#46;1=',
						'SCENES.Templates.4Box&#46;1.Layers',
						'SCENES.Templates.4Box&#46;1.Transitions',
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
					'list_ex:SCENES.Folder&#46;1': ['list_ex:SCENES.Folder&#46;1=', 'SCENES.Folder&#46;1.Scene&#46;1', ''],
					'list_ex:SCENES.Folder&#46;1.Scene&#46;1': [
						'list_ex:SCENES.Folder&#46;1.Scene&#46;1=',
						'SCENES.Folder&#46;1.Scene&#46;1.Layers',
						'SCENES.Folder&#46;1.Scene&#46;1.Transitions',
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

				throw new Error(`Unexpected message: ${message}`)
			})

			expect(await connection.listScenes(undefined, true)).toStrictEqual([
				{ realm: 'scene', scenePath: ['Main'], name: 'Main' },
				{ realm: 'scene', scenePath: ['Templates'], name: 'Templates' },
				{ realm: 'scene', scenePath: ['Folder.1'], name: 'Folder.1' },
				{ realm: 'scene', scenePath: ['Templates', '2Box'], name: '2Box' },
				{ realm: 'scene', scenePath: ['Templates', '4Box.1'], name: '4Box.1' },
				{ realm: 'scene', scenePath: ['Templates', 'OTS Left'], name: 'OTS Left' },
				{ realm: 'scene', scenePath: ['Templates', 'OTS Right'], name: 'OTS Right' },
				{ realm: 'scene', scenePath: ['Templates', 'Title'], name: 'Title' },
				{ realm: 'scene', scenePath: ['Templates', 'Sidecar'], name: 'Sidecar' },
				{ realm: 'scene', scenePath: ['Folder.1', 'Scene.1'], name: 'Scene.1' },
			] satisfies (SceneRef & { name: string })[])

			expect(
				await connection.updateScene(refScene(['Main']), {
					advancedResolutionControl: false,
					allDuration: 20,
					allFader: 0,
					color: {
						red: 255,
						green: 0,
						blue: 0,
					},
					faderReverse: false,
					faderSync: false,
					// keyPreview: '<unknown>',
					// limitOffAction: NaN,
					limitReturnTime: 20,
					nextTransition: [refSceneTransition(refMain, ['BgdMix'])],
					// nextTransitionType: '<unknown>',
				})
			).toBeUndefined()

			expect(await connection.getScene(refScene(['Main']))).toStrictEqual({
				advancedResolutionControl: false,
				allDuration: 20,
				allFader: 0,
				color: {
					red: 255,
					green: 0,
					blue: 0,
				},
				faderReverse: false,
				faderSync: false,
				keyPreview: '<unknown>',
				limitOffAction: SceneLimitOffAction.None,
				limitReturnTime: 20,
				nextTransition: [refSceneTransition(refMain, ['BgdMix'])],
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
						'SCENES.Main.Layers.Group&#46;1',
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
					'list_ex:SCENES.Main.Layers.Group&#46;1': [
						'list_ex:SCENES.Main.Layers.Group&#46;1=',
						'SCENES.Main.Layers.Group&#46;1.Effects',
						'SCENES.Main.Layers.Group&#46;1.InnerLayer',
						'',
					],
					'list_ex:SCENES.Main.Layers.Group&#46;1.InnerLayer': [
						'list_ex:SCENES.Main.Layers.Group&#46;1.InnerLayer=',
						'SCENES.Main.Layers.Group&#46;1.InnerLayer.Effects',
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
					'SCENES.Main.Layers.Background.sourceA=SCENES.Folder&#46;1.Scene&#46;1': ['OK'],
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
					name: 'Group.1',
					scenePath: ['Main'],
					layerPath: ['Group.1'],
				},
				{
					realm: 'scene-layer',
					name: 'InnerLayer',
					scenePath: ['Main'],
					layerPath: ['Group.1', 'InnerLayer'],
				},
			])

			expect(
				await connection.updateSceneLayer(refSceneLayer(refMain, ['Background']), {
					// blendMode: NaN,
					cleanMask: 0,
					color: {
						red: 255,
						green: 0,
						blue: 0,
					},
					dissolveEnabled: false,
					// dissolveMode: NaN,
					dissolveTime: 50,
					// mode: NaN,
					opacity: 1,
					// pgmPstMode: NaN,
					presetEnabled: true,
					sourceA: refScene(['Folder.1', 'Scene.1']), // A scene named "Scene.1" in folder "Folder:1"
					sourceCleanMask: 0,
					sourceOptions: [
						refSourceBase(['BLACK']),
						refClipPlayer(['CP1']),
						refClipPlayer(['CP2']),
						refRamRecorder(['RR1']),
						refRamRecorder(['RR2']),
						refRamRecorder(['RR3']),
						refRamRecorder(['RR4']),
						refRamRecorder(['RR5']),
						refRamRecorder(['RR6']),
						refRamRecorder(['RR7']),
						refRamRecorder(['RR8']),
						refImageStore(['IS1']),
						refImageStore(['IS2']),
						refImageStore(['IS3']),
						refImageStore(['IS4']),
						refImageStore(['IS5']),
						refImageStore(['IS6']),
						refImageStore(['IS7']),
						refImageStore(['IS8']),
						refScene(['Templates', '2Box']),
						refScene(['Templates', '4Box']),
						refScene(['Templates', 'OTS Left']),
						refScene(['Templates', 'OTS Right']),
						refScene(['Templates', 'Title']),
						refScene(['Templates', 'Sidecar']),
					],
					sourcePgm: refSourceBase(['BLACK']),
					sourcePst: refSourceBase(['BLACK']),
				})
			).toBeUndefined()

			expect(await connection.getSceneLayer(refSceneLayer(refMain, ['Background']))).toStrictEqual({
				activeBus: SceneLayerActiveBus.ABus,
				blendMode: SceneLayerBlendMode.Default,
				cleanMask: 0,
				color: {
					red: 255,
					green: 0,
					blue: 0,
				},
				dissolveEnabled: false,
				dissolveMode: SceneLayerDissolveMode.Normal,
				dissolveTime: 50,
				fxEnabled: false,
				mode: SceneLayerMode.Auto,
				opacity: 1,
				pgmPstMode: SceneLayerPgmPstMode.Swap,
				presetEnabled: true,
				sourceA: refSourceBase(['BLACK']),
				sourceB: refSourceBase(['BLACK']),
				sourceCleanMask: 0,
				sourceOptions: [
					refSourceBase(['BLACK']),
					refClipPlayer(['CP1']),
					refClipPlayer(['CP2']),
					refRamRecorder(['RR1']),
					refRamRecorder(['RR2']),
					refRamRecorder(['RR3']),
					refRamRecorder(['RR4']),
					refRamRecorder(['RR5']),
					refRamRecorder(['RR6']),
					refRamRecorder(['RR7']),
					refRamRecorder(['RR8']),
					refImageStore(['IS1']),
					refImageStore(['IS2']),
					refImageStore(['IS3']),
					refImageStore(['IS4']),
					refImageStore(['IS5']),
					refImageStore(['IS6']),
					refImageStore(['IS7']),
					refImageStore(['IS8']),
					refScene(['Templates', '2Box']),
					refScene(['Templates', '4Box']),
					refScene(['Templates', 'OTS Left']),
					refScene(['Templates', 'OTS Right']),
					refScene(['Templates', 'Title']),
					refScene(['Templates', 'Sidecar']),
				],
				sourcePgm: refSourceBase(['BLACK']),
				sourcePst: refSourceBase(['BLACK']),
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
		describe('SCENES.Layers.Effects', async () => {
			test('List', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'list_ex:SCENES.Main.Layers.Group&#46;1.Effects': [
							'list_ex:SCENES.Main.Layers.Group&#46;1.Effects=',
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop',
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D',
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey',
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey',
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1',
							'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1',
							'',
						],
					}[message]
					if (reply) return reply

					throw new Error(`Unexpected message: ${message}`)
				})
				expect(await connection.listSceneLayerEffects(refBackground)).toStrictEqual([
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['Crop'],
						name: 'Crop',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['Transform2D'],
						name: 'Transform2D',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['LuminanceKey'],
						name: 'LuminanceKey',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['ChromaKey'],
						name: 'ChromaKey',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['YUVCorrection-1'],
						name: 'YUVCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['RGBCorrection-1'],
						name: 'RGBCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['LUTCorrection-1'],
						name: 'LUTCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['VirtualPTZ-1'],
						name: 'VirtualPTZ-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['ToneCurveCorrection-1'],
						name: 'ToneCurveCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['MatrixCorrection-1'],
						name: 'MatrixCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['TemperatureCorrection-1'],
						name: 'TemperatureCorrection-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['LinearKey-1'],
						name: 'LinearKey-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['Position-1'],
						name: 'Position-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['PCrop-1'],
						name: 'PCrop-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['FilmLook-1'],
						name: 'FilmLook-1',
					},
					{
						realm: 'scene-layer-effect',
						scenePath: ['Main'],
						layerPath: ['Group.1'],
						effectPath: ['GlowEffect-1'],
						name: 'GlowEffect-1',
					},
				])
			})

			test('Crop', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.top=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.left=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.right=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.bottom=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.rounded_corners=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.global_softness=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.top': ['SCENES.Main.Layers.Group&#46;1.Effects.Crop.top=0'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.left': ['SCENES.Main.Layers.Group&#46;1.Effects.Crop.left=0'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.right': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.right=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.bottom': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.bottom=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.rounded_corners': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.rounded_corners=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.global_softness': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.global_softness=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_top': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_top=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_left': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_left=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_right': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_right=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_bottom': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Crop.softness_bottom=0',
						],
					}[message]
					if (reply) return reply

					throw new Error(`Unexpected message: ${message}`)
				})

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
			})
			test('Transform2D', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.type=2D': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.scale=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_z=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_origin=0/0/0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.position=0/0/0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.cubic_interpolation=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.hide_backside=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_h=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_v=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.type': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.type=2D',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.scale': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.scale=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_x': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_x=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_y': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_y=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_z': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_z=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_origin': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.rotation_origin=0/0/0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.position': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.position=0/0/0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.cubic_interpolation': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.cubic_interpolation=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.hide_backside': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.hide_backside=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_h': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_h=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_v': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Transform2D.stretch_v=0',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
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
			})
			test('LuminanceKey', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.clip=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.gain=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.cleanup=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.density=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.invert=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.blend_mode=Auto': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.clip': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.clip=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.gain': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.gain=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.cleanup': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.cleanup=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.density': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.density=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.invert': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.invert=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.blend_mode': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.blend_mode=Auto',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.sourceKey': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.sourceKey=<unknown>',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.auto_adjust=': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LuminanceKey.sourceKey=BLACK': ['OK'],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectLuminanceKey(refSceneLayerEffect(refBackground, ['LuminanceKey']), {
						blendMode: SceneLayerEffectLuminanceKeyBlendMode.Auto,
						cleanup: 0,
						clip: 0.5,
						density: 0,
						enabled: false,
						gain: 1,
						invert: false,
						sourceKey: refSourceBase(['BLACK']),
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
					sourceKey: null, // '<unknown>',
				} satisfies SceneLayerEffectLuminanceKeyObject)

				expect(
					await connection.sceneLayerEffectLuminanceKeyAutoAdjust(refSceneLayerEffect(refBackground, ['LuminanceKey']))
				).toBeUndefined()
			})
			test('ChromaKey', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.clip=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.gain=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.cleanup=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.density=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.hue=2.25': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_left=0.3': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_right=0.3': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.luminance=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.chroma=0.2': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.a_chroma=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression=0.3': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_left=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_right=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.noise_removal=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.invert=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.fgd_fade=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.auto_state=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.edge_smoothing_size=Off': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.clip': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.clip=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.gain': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.gain=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.cleanup': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.cleanup=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.density': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.density=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.hue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.hue=2.25',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_left': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_left=0.3',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_right': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.selectivity_right=0.3',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.luminance': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.luminance=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.chroma': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.chroma=0.2',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.a_chroma': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.a_chroma=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression=0.3',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_left': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_left=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_right': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.spill_supression_right=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.noise_removal': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.noise_removal=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.invert': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.invert=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.fgd_fade': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.fgd_fade=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.auto_state': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.auto_state=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.edge_smoothing_size': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.edge_smoothing_size=Off',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ChromaKey.auto_adjust=': ['OK'],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
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
			})
			test('YUVCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.pedestal=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_lift=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gain=0.991582': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gamma=0.997782': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.contrast=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.saturation=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.UV_rotation=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.cyan_red=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.magenta_green=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.yellow_blue=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.pedestal': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.pedestal=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_lift': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_lift=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gain': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gain=0.991582',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gamma': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.luminance_gamma=0.997782',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.contrast': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.contrast=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.saturation': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.saturation=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.UV_rotation': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.UV_rotation=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.cyan_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.cyan_red=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.magenta_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.magenta_green=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.yellow_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.YUVCorrection-1.yellow_blue=0',
						],
					}[message]
					if (reply) return reply

					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectYUVCorrection(
						refSceneLayerEffect(refBackground, ['YUVCorrection-1']),
						{
							contrast: 0,
							cyanRed: 0,
							enabled: false,
							luminanceGain: 0.991582,
							luminanceGamma: 0.997782,
							luminanceLift: 0,
							magentaGreen: 0,
							pedestal: 0,
							saturation: 1,
							uvRotation: 0,
							yellowBlue: 0,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectYUVCorrection(refSceneLayerEffect(refBackground, ['YUVCorrection-1']))
				).toStrictEqual({
					contrast: 0,
					cyanRed: 0,
					enabled: false,
					luminanceGain: 0.991582,
					luminanceGamma: 0.997782,
					luminanceLift: 0,
					magentaGreen: 0,
					pedestal: 0,
					saturation: 1,
					uvRotation: 0,
					yellowBlue: 0,
				} satisfies SceneLayerEffectYUVCorrectionObject)
			})
			test('RGBCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_red=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_green=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_blue=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_red=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_green=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_blue=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_red=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_green=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_blue=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_red=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_green=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_blue=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_red=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_green=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.pedestal_blue=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_red=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_green=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.lift_blue=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_red=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_green=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gain_blue=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_red=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_green=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.RGBCorrection-1.gamma_blue=1',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectRGBCorrection(
						refSceneLayerEffect(refBackground, ['RGBCorrection-1']),
						{
							enabled: false,
							gainBlue: 1,
							gainGreen: 1,
							gainRed: 1,
							gammaBlue: 1,
							gammaGreen: 1,
							gammaRed: 1,
							liftBlue: 0,
							liftGreen: 0,
							liftRed: 0,
							pedestalBlue: 0,
							pedestalGreen: 0,
							pedestalRed: 0,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectRGBCorrection(refSceneLayerEffect(refBackground, ['RGBCorrection-1']))
				).toStrictEqual({
					enabled: false,
					gainBlue: 1,
					gainGreen: 1,
					gainRed: 1,
					gammaBlue: 1,
					gammaGreen: 1,
					gammaRed: 1,
					liftBlue: 0,
					liftGreen: 0,
					liftRed: 0,
					pedestalBlue: 0,
					pedestalGreen: 0,
					pedestalRed: 0,
				} satisfies SceneLayerEffectRGBCorrectionObject)
			})
			test('LUTCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.index=Cinema': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_colorspace=BT709': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_colorspace=BT709': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_range=Normal': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_range=Normal': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.color_space_conversion=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.index': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.index=Cinema',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_colorspace': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_colorspace=BT709',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_colorspace': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_colorspace=BT709',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_range': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.input_range=Normal',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_range': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.output_range=Normal',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.color_space_conversion': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LUTCorrection-1.color_space_conversion=0',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectLUTCorrection(
						refSceneLayerEffect(refBackground, ['LUTCorrection-1']),
						{
							colorSpaceConversion: false,
							enabled: false,
							index: SceneLayerEffectLUTCorrectionIndex.Cinema,
							inputColorspace: SceneLayerEffectLUTCorrectionColorspace.BT709,
							inputRange: SceneLayerEffectLUTCorrectionRange.Normal,
							outputColorspace: SceneLayerEffectLUTCorrectionColorspace.BT709,
							outputRange: SceneLayerEffectLUTCorrectionRange.Normal,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectLUTCorrection(refSceneLayerEffect(refBackground, ['LUTCorrection-1']))
				).toStrictEqual({
					colorSpaceConversion: false,
					enabled: false,
					index: SceneLayerEffectLUTCorrectionIndex.Cinema,
					inputColorspace: SceneLayerEffectLUTCorrectionColorspace.BT709,
					inputRange: SceneLayerEffectLUTCorrectionRange.Normal,
					outputColorspace: SceneLayerEffectLUTCorrectionColorspace.BT709,
					outputRange: SceneLayerEffectLUTCorrectionRange.Normal,
				} satisfies SceneLayerEffectLUTCorrectionObject)
			})
			test('VirtualPTZ', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.position=0/0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.zoom=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.position': [
							'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.position=0/0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.zoom': [
							'SCENES.Main.Layers.Group&#46;1.Effects.VirtualPTZ-1.zoom=1',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectVirtualPTZ(refSceneLayerEffect(refBackground, ['VirtualPTZ-1']), {
						enabled: false,
						position: {
							x: 0,
							y: 0,
						},
						zoom: 1,
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectVirtualPTZ(refSceneLayerEffect(refBackground, ['VirtualPTZ-1']))
				).toStrictEqual({
					enabled: false,
					position: {
						x: 0,
						y: 0,
					},
					zoom: 1,
				} satisfies SceneLayerEffectVirtualPTZObject)
			})
			test('ToneCurveCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_red=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_green=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_blue=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_red=0.3333': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_green=0.3333': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_blue=0.3333': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_red=0.6666': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_green=0.6666': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_blue=0.6666': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_red=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_green=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_blue=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_red=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_green=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.black_blue=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_red=0.3333',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_green=0.3333',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_low_blue=0.3333',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_red=0.6666',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_green=0.6666',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.gray_high_blue=0.6666',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_red': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_red=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_green': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_green=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_blue': [
							'SCENES.Main.Layers.Group&#46;1.Effects.ToneCurveCorrection-1.white_blue=1',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectToneCurveCorrection(
						refSceneLayerEffect(refBackground, ['ToneCurveCorrection-1']),
						{
							blackBlue: 0,
							blackGreen: 0,
							blackRed: 0,
							enabled: false,
							grayHighBlue: 0.6666,
							grayHighGreen: 0.6666,
							grayHighRed: 0.6666,
							grayLowBlue: 0.3333,
							grayLowGreen: 0.3333,
							grayLowRed: 0.3333,
							whiteBlue: 1,
							whiteGreen: 1,
							whiteRed: 1,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectToneCurveCorrection(
						refSceneLayerEffect(refBackground, ['ToneCurveCorrection-1'])
					)
				).toStrictEqual({
					blackBlue: 0,
					blackGreen: 0,
					blackRed: 0,
					enabled: false,
					grayHighBlue: 0.6666,
					grayHighGreen: 0.6666,
					grayHighRed: 0.6666,
					grayLowBlue: 0.3333,
					grayLowGreen: 0.3333,
					grayLowRed: 0.3333,
					whiteBlue: 1,
					whiteGreen: 1,
					whiteRed: 1,
				} satisfies SceneLayerEffectToneCurveCorrectionObject)
			})
			test('MatrixCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_n=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_p=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_phase=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_level=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-g_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.r-b_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-r_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.g-b_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-r_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_n': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_n=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_p': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.b-g_p=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.red_level=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.yellow_level=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.green_level=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.cyan_level=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.blue_level=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_phase': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_phase=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_level': [
							'SCENES.Main.Layers.Group&#46;1.Effects.MatrixCorrection-1.magenta_level=1',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectMatrixCorrection(
						refSceneLayerEffect(refBackground, ['MatrixCorrection-1']),
						{
							bgN: 0,
							bgP: 0,
							blueLevel: 1,
							bluePhase: 0,
							brN: 0,
							brP: 0,
							cyanLevel: 1,
							cyanPhase: 0,
							enabled: false,
							gbN: 0,
							gbP: 0,
							grN: 0,
							grP: 0,
							greenLevel: 1,
							greenPhase: 0,
							magentaLevel: 1,
							magentaPhase: 0,
							rbN: 0,
							rbP: 0,
							redLevel: 1,
							redPhase: 0,
							rgN: 0,
							rgP: 0,
							yellowLevel: 1,
							yellowPhase: 0,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectMatrixCorrection(
						refSceneLayerEffect(refBackground, ['MatrixCorrection-1'])
					)
				).toStrictEqual({
					bgN: 0,
					bgP: 0,
					blueLevel: 1,
					bluePhase: 0,
					brN: 0,
					brP: 0,
					cyanLevel: 1,
					cyanPhase: 0,
					enabled: false,
					gbN: 0,
					gbP: 0,
					grN: 0,
					grP: 0,
					greenLevel: 1,
					greenPhase: 0,
					magentaLevel: 1,
					magentaPhase: 0,
					rbN: 0,
					rbP: 0,
					redLevel: 1,
					redPhase: 0,
					rgN: 0,
					rgP: 0,
					yellowLevel: 1,
					yellowPhase: 0,
				} satisfies SceneLayerEffectMatrixCorrectionObject)
			})
			test('TemperatureCorrection', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.temperature=6600': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.tint=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.keep_luminance=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.temperature': [
							'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.temperature=6600',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.tint': [
							'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.tint=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.keep_luminance': [
							'SCENES.Main.Layers.Group&#46;1.Effects.TemperatureCorrection-1.keep_luminance=1',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectTemperatureCorrection(
						refSceneLayerEffect(refBackground, ['TemperatureCorrection-1']),
						{
							enabled: false,
							keepLuminance: true,
							temperature: 6600,
							tint: 0,
						}
					)
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectTemperatureCorrection(
						refSceneLayerEffect(refBackground, ['TemperatureCorrection-1'])
					)
				).toStrictEqual({
					enabled: false,
					keepLuminance: true,
					temperature: 6600,
					tint: 0,
				} satisfies SceneLayerEffectTemperatureCorrectionObject)
			})
			test('LinearKey', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.invert=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.blend_mode=Auto': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.invert': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.invert=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.key_source': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.key_source=<unknown>',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.blend_mode': [
							'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.blend_mode=Auto',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.LinearKey-1.key_source=BLACK': ['OK'],
					}[message]
					if (reply) return reply

					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectLinearKey(refSceneLayerEffect(refBackground, ['LinearKey-1']), {
						blendMode: SceneLayerEffectLinearKeyBlendMode.Auto,
						enabled: false,
						invert: false,
						keySource: refSourceBase(['BLACK']),
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectLinearKey(refSceneLayerEffect(refBackground, ['LinearKey-1']))
				).toStrictEqual({
					blendMode: SceneLayerEffectLinearKeyBlendMode.Auto,
					enabled: false,
					invert: false,
					keySource: null, // '<unknown>',
				} satisfies SceneLayerEffectLinearKeyObject)
			})
			test('Position', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.position=0/0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.height=360': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.rotate=0°': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.position': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.position=0/0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.width': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.width=2037',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.height': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.height=360',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.rotate': [
							'SCENES.Main.Layers.Group&#46;1.Effects.Position-1.rotate=0°',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectPosition(refSceneLayerEffect(refBackground, ['Position-1']), {
						enabled: false,
						height: 360,
						position: {
							x: 0,
							y: 0,
						},
						rotate: SceneLayerEffectPositionRotate.Rotate0,
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectPosition(refSceneLayerEffect(refBackground, ['Position-1']))
				).toStrictEqual({
					enabled: false,
					width: 2037,
					height: 360,
					position: {
						x: 0,
						y: 0,
					},
					rotate: SceneLayerEffectPositionRotate.Rotate0,
				} satisfies SceneLayerEffectPositionObject)
			})
			test('PCrop', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.enabled=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.left=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.right=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.top=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.bottom=0': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.enabled': [
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.enabled=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.left': [
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.left=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.right': [
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.right=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.top': [
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.top=0',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.bottom': [
							'SCENES.Main.Layers.Group&#46;1.Effects.PCrop-1.bottom=0',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectPCrop(refSceneLayerEffect(refBackground, ['PCrop-1']), {
						bottom: 0,
						enabled: false,
						left: 0,
						right: 0,
						top: 0,
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectPCrop(refSceneLayerEffect(refBackground, ['PCrop-1']))
				).toStrictEqual({
					bottom: 0,
					enabled: false,
					left: 0,
					right: 0,
					top: 0,
				} satisfies SceneLayerEffectPCropObject)
			})
			test('FilmLook', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.crack=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.spots=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.grain=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shake=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shadow=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color mode=Sepia': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color strength=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.crack': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.crack=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.spots': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.spots=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.grain': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.grain=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shake': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shake=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shadow': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.shadow=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color mode': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color mode=Sepia',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color strength': [
							'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.color strength=0.5',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectFilmLook(refSceneLayerEffect(refBackground, ['FilmLook-1']), {
						colorMode: SceneLayerEffectFilmLookColorMode.Sepia,
						colorStrength: 0.5,
						crack: 0.5,
						grain: 0.5,
						shadow: 0.5,
						shake: 0.5,
						spots: 0.5,
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectFilmLook(refSceneLayerEffect(refBackground, ['FilmLook-1']))
				).toStrictEqual({
					colorMode: SceneLayerEffectFilmLookColorMode.Sepia,
					colorStrength: 0.5,
					crack: 0.5,
					grain: 0.5,
					shadow: 0.5,
					shake: 0.5,
					spots: 0.5,
				} satisfies SceneLayerEffectFilmLookObject)
			})
			test('GlowEffect', async () => {
				connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
					const reply = {
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.clip=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.gain=1': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.softness=0.5': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.glow color=rgb(255,255,255)': ['OK'],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.clip': [
							'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.clip=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.gain': [
							'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.gain=1',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.softness': [
							'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.softness=0.5',
						],
						'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.glow color': [
							'SCENES.Main.Layers.Group&#46;1.Effects.GlowEffect-1.glow color=rgb(255,255,255)',
						],
					}[message]
					if (reply) return reply
					throw new Error(`Unexpected message: ${message}`)
				})
				expect(
					await connection.updateSceneLayerEffectGlowEffect(refSceneLayerEffect(refBackground, ['GlowEffect-1']), {
						clip: 0.5,
						gain: 1,
						glowColor: {
							blue: 255,
							green: 255,
							red: 255,
						},
						softness: 0.5,
					})
				).toBeUndefined()
				expect(
					await connection.getSceneLayerEffectGlowEffect(refSceneLayerEffect(refBackground, ['GlowEffect-1']))
				).toStrictEqual({
					clip: 0.5,
					gain: 1,
					glowColor: {
						blue: 255,
						green: 255,
						red: 255,
					},
					softness: 0.5,
				} satisfies SceneLayerEffectGlowEffectObject)
			})
		})
		// SCENES.Scene
		// 			Transitions
		// 				Transition
		// 				BgdMix
		// 					TransitionEffect

		test('SCENES.Layers.Transitions', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:SCENES.Main.Transitions': [
						'list_ex:SCENES.Main.Transitions=',
						'SCENES.Main.Transitions.BgdMix',
						'SCENES.Main.Transitions.L1',
						'SCENES.Main.Transitions.L2',
						'',
					],
					'list_ex:SCENES.Main.Transitions.BgdMix': [
						'list_ex:SCENES.Main.Transitions.BgdMix=',
						'SCENES.Main.Transitions.BgdMix.BgdMix',
						'',
					],
					'list_ex:SCENES.Main.Transitions.L1': [
						'list_ex:SCENES.Main.Transitions.L1=',
						'SCENES.Main.Transitions.L1.L1',
						'SCENES.Main.Transitions.L1.Element-1',
						'',
					],
					'list_ex:SCENES.Main.Transitions.L2': [
						'list_ex:SCENES.Main.Transitions.L2=',
						'SCENES.Main.Transitions.L2.L2',
						'',
					],
					'list_ex:SCENES.Main.Transitions.BgdMix.BgdMix': [
						'list_ex:SCENES.Main.Transitions.BgdMix.BgdMix=',
						'SCENES.Main.Transitions.BgdMix.BgdMix.Effect-1',
						'',
					],
					'list_ex:SCENES.Main.Transitions.L1.L1': [
						'list_ex:SCENES.Main.Transitions.L1.L1=',
						'SCENES.Main.Transitions.L1.L1.Effect-1',
						'',
					],
					'list_ex:SCENES.Main.Transitions.L1.Element-1': [
						'list_ex:SCENES.Main.Transitions.L1.Element-1=',
						'SCENES.Main.Transitions.L1.Element-1.Effect-1',
						'',
					],
					'list_ex:SCENES.Main.Transitions.L2.L2': [
						'list_ex:SCENES.Main.Transitions.L2.L2=',
						'SCENES.Main.Transitions.L2.L2.Effect-1',
						'',
					],
					'SCENES.Main.Layers.Group&#46;1.Effects.FilmLook-1.progress': ['Error'],
					'SCENES.Main.Transitions.L1.progress': ['SCENES.Main.Transitions.L1.progress=0'],
					'SCENES.Main.Transitions.L1.progressFrames': ['SCENES.Main.Transitions.L1.progressFrames=0'],
					'SCENES.Main.Transitions.L1.duration': ['SCENES.Main.Transitions.L1.duration=20'],
					'SCENES.Main.Snapshots.SNP1.transition_cut=': ['Error'],
					'SCENES.Main.Transitions.L1.duration=20': ['OK'],
					'SCENES.Main.Transitions.L1.transition_cut=': ['OK'],
					'SCENES.Main.Transitions.L1.transition_auto=': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})
			expect(await connection.listSceneTransitions(refMain)).toStrictEqual([
				{
					name: 'BgdMix',
					realm: 'scene-transition',
					scenePath: ['Main'],
					transitionPath: ['BgdMix'],
					mixes: [
						{
							mixPath: ['BgdMix'],
							name: 'BgdMix',
							realm: 'scene-transition-mix',
							scenePath: ['Main'],
							transitionPath: ['BgdMix'],
							effects: [
								{
									effectPath: ['Effect-1'],
									mixPath: ['BgdMix'],
									name: 'Effect-1',
									realm: 'scene-transition-mix-effect',
									scenePath: ['Main'],
									transitionPath: ['BgdMix'],
								},
							],
						},
					],
				},
				{
					name: 'L1',
					realm: 'scene-transition',
					scenePath: ['Main'],
					transitionPath: ['L1'],
					mixes: [
						{
							mixPath: ['L1'],
							name: 'L1',
							realm: 'scene-transition-mix',
							scenePath: ['Main'],
							transitionPath: ['L1'],
							effects: [
								{
									effectPath: ['Effect-1'],
									mixPath: ['L1'],
									name: 'Effect-1',
									realm: 'scene-transition-mix-effect',
									scenePath: ['Main'],
									transitionPath: ['L1'],
								},
							],
						},
						{
							mixPath: ['Element-1'],
							name: 'Element-1',
							realm: 'scene-transition-mix',
							scenePath: ['Main'],
							transitionPath: ['L1'],
							effects: [
								{
									effectPath: ['Effect-1'],
									mixPath: ['Element-1'],
									name: 'Effect-1',
									realm: 'scene-transition-mix-effect',
									scenePath: ['Main'],
									transitionPath: ['L1'],
								},
							],
						},
					],
				},
				{
					name: 'L2',
					realm: 'scene-transition',
					scenePath: ['Main'],
					transitionPath: ['L2'],
					mixes: [
						{
							mixPath: ['L2'],
							name: 'L2',
							realm: 'scene-transition-mix',
							scenePath: ['Main'],
							transitionPath: ['L2'],
							effects: [
								{
									effectPath: ['Effect-1'],
									mixPath: ['L2'],
									name: 'Effect-1',
									realm: 'scene-transition-mix-effect',
									scenePath: ['Main'],
									transitionPath: ['L2'],
								},
							],
						},
					],
				},
			] satisfies SceneTransition[])

			const refTransition = refSceneTransition(refMain, ['L1'])

			expect(
				await connection.updateSceneTransition(refTransition, {
					duration: 20,
				})
			).toBeUndefined()
			expect(await connection.getSceneTransition(refTransition)).toStrictEqual({
				duration: 20,
				progress: 0,
				progressFrames: 0,
			} satisfies SceneTransitionObject)

			expect(await connection.sceneTransitionTransitionCut(refTransition)).toBeUndefined()
			expect(await connection.sceneTransitionTransitionAuto(refTransition)).toBeUndefined()
		})

		test('SCENES.Layers.Transitions.Mix.Effect', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'SCENES.Main.Transitions.L1.L1.Effect-1.curve=Linear': ['OK'],
					'SCENES.Main.Transitions.L1.L1.Effect-1.curve': ['SCENES.Main.Transitions.L1.L1.Effect-1.curve=Linear'],
					'SCENES.Main.Transitions.L1.L1.Effect-1.effect': ['SCENES.Main.Transitions.L1.L1.Effect-1.effect=MIX_FX.Mix'],
					'SCENES.Main.Transitions.L1.L1.Effect-1.effect_name': [
						'SCENES.Main.Transitions.L1.L1.Effect-1.effect_name=Mix',
					],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})

			const refTransition = refSceneTransition(refMain, ['L1'])
			const refTransitionMix = refSceneTransitionMix(refTransition, ['L1'])
			const refTransitionMixEffect = refSceneTransitionMixEffect(refTransitionMix, ['Effect-1'])

			expect(
				await connection.updateSceneTransitionMixEffect(refTransitionMixEffect, {
					curve: SceneCurve.Linear,
				})
			).toBeUndefined()
			expect(await connection.getSceneTransitionMixEffect(refTransitionMixEffect)).toStrictEqual({
				curve: SceneCurve.Linear,
				effect: 'MIX_FX.Mix',
				effectName: 'Mix',
			} satisfies SceneTransitionMixEffectObject)
		})
		// SCENES.Scene.Layers.Layer
		// 			Snapshots
		// 				SNP

		test('SCENES.Layers.Snapshots', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:SCENES.Main.Snapshots': [
						'list_ex:SCENES.Main.Snapshots=',
						'SCENES.Main.Snapshots.SNP1',
						'SCENES.Main.Snapshots.SNP2',
						'SCENES.Main.Snapshots.SNP3',
						'',
					],
					'SCENES.Main.Snapshots.SNP1.color=rgb(255,0,0)': ['OK'],
					'SCENES.Main.Snapshots.SNP1.dissolve_time=0': ['OK'],
					'SCENES.Main.Snapshots.SNP1.enable_curve=0': ['OK'],
					'SCENES.Main.Snapshots.SNP1.curve=Linear': ['OK'],
					'SCENES.Main.Snapshots.SNP1.priority_recall=Off': ['OK'],
					'SCENES.Main.Snapshots.SNP1.status': ['SCENES.Main.Snapshots.SNP1.status=Stopped'],
					'SCENES.Main.Snapshots.SNP1.color': ['SCENES.Main.Snapshots.SNP1.color=rgb(255,0,0)'],
					'SCENES.Main.Snapshots.SNP1.dissolve_time': ['SCENES.Main.Snapshots.SNP1.dissolve_time=0'],
					'SCENES.Main.Snapshots.SNP1.enable_curve': ['SCENES.Main.Snapshots.SNP1.enable_curve=0'],
					'SCENES.Main.Snapshots.SNP1.curve': ['SCENES.Main.Snapshots.SNP1.curve=Linear'],
					'SCENES.Main.Snapshots.SNP1.priority_recall': ['SCENES.Main.Snapshots.SNP1.priority_recall=Off'],
					'SCENES.Main.Snapshots.SNP1.recall=': ['OK'],
					'SCENES.Main.Snapshots.SNP1.force_dissolve=': ['OK'],
					'SCENES.Main.Snapshots.SNP1.force_recall=': ['OK'],
					'SCENES.Main.Snapshots.SNP1.update=': ['OK'],
					'SCENES.Main.Snapshots.SNP1.abort=': ['OK'],
					'SCENES.Main.Snapshots.SNP1.delete_ex=': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})
			expect(await connection.listSceneSnapshots(refMain)).toStrictEqual([
				{
					name: 'SNP1',
					realm: 'scene-snapshot',
					scenePath: ['Main'],
					snapshotPath: ['SNP1'],
				},
				{
					name: 'SNP2',
					realm: 'scene-snapshot',
					scenePath: ['Main'],
					snapshotPath: ['SNP2'],
				},
				{
					name: 'SNP3',
					realm: 'scene-snapshot',
					scenePath: ['Main'],
					snapshotPath: ['SNP3'],
				},
			])
			expect(
				await connection.updateSceneSnapshot(refSceneSnapshot(refMain, ['SNP1']), {
					color: {
						blue: 0,
						green: 0,
						red: 255,
					},
					dissolveTime: 0,
					enableCurve: false,
					curve: SceneCurve.Linear,
					priorityRecall: SceneSnapshotPriorityRecall.Off,
					// status is read only
				})
			).toBeUndefined()
			expect(await connection.getSceneSnapshot(refSceneSnapshot(refMain, ['SNP1']))).toStrictEqual({
				status: SceneSnapshotStatus.Stopped,
				color: {
					blue: 0,
					green: 0,
					red: 255,
				},
				dissolveTime: 0,
				enableCurve: false,
				curve: SceneCurve.Linear,
				priorityRecall: SceneSnapshotPriorityRecall.Off,
			} satisfies SceneSnapshotObject)

			expect(await connection.sceneSnapshotRecall(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
			expect(await connection.sceneSnapshotForceDissolve(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
			expect(await connection.sceneSnapshotForceRecall(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
			expect(await connection.sceneSnapshotUpdate(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
			expect(await connection.sceneSnapshotAbort(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
			expect(await connection.sceneSnapshotDeleteEx(refSceneSnapshot(refMain, ['SNP1']))).toBeUndefined()
		})

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
					color: {
						red: 255,
						green: 255,
						blue: 255,
					},
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
				color: {
					red: 255,
					green: 255,
					blue: 255,
				},
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
					color: {
						red: 255,
						green: 255,
						blue: 255,
					},
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
				color: {
					red: 255,
					green: 255,
					blue: 255,
				},
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

		test('MACROS', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:MACROS': ['list_ex:MACROS=', 'MACROS.M-1', ''],
					'list_ex:MACROS.M-1': ['list_ex:MACROS.M-1=', ''],
					'MACROS.M-1.color=rgb(255,255,0)': ['OK'],
					'MACROS.M-1.status': ['MACROS.M-1.status=Stopped'],
					'MACROS.M-1.color': ['MACROS.M-1.color=rgb(255,255,255)'],
					'MACROS.M-1.play=': ['OK'],
					'MACROS.M-1.continue=': ['OK'],
					'MACROS.M-1.record=': ['OK'],
					'MACROS.M-1.stop_record=': ['OK'],
					'MACROS.M-1.pause=': ['OK'],
					'MACROS.M-1.stop=': ['OK'],
					'MACROS.M-1.delete_ex=': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})
			expect(await connection.listMacros(undefined, true)).toStrictEqual([
				{
					realm: 'macro',
					macroPath: ['M-1'],
					name: 'M-1',
				},
			])
			expect(
				await connection.updateMacro(refMacro(['M-1']), {
					color: {
						blue: 0,
						green: 255,
						red: 255,
					},
					// status is read only
				})
			).toBeUndefined()
			expect(await connection.getMacro(refMacro(['M-1']))).toStrictEqual({
				color: {
					blue: 255,
					green: 255,
					red: 255,
				},
				status: MacroStatus.Stopped,
			} satisfies MacroObject)

			expect(await connection.macroPlay(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroContinue(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroRecord(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroStopRecord(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroPause(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroStop(refMacro(['M-1']))).toBeUndefined()
			expect(await connection.macroDeleteEx(refMacro(['M-1']))).toBeUndefined()
		})

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
		test('GFXCHANNELS commands', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'GFX1.scene': ['GFX1.scene=GFXSCENES.Old'],
					'GFX1.scene=GFXSCENES.Subfolder.New': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})
			expect(await connection.getGfxChannel(1)).toStrictEqual({
				scene: refGfxScene(['Old']),
			} satisfies GfxChannelObject)
			expect(
				await connection.updateGfxChannel(1, {
					scene: refGfxScene(['Subfolder', 'New']),
				})
			).toBeUndefined()
		})
		// GFXSCENES
		// 	GfxScene
		test('GFXSCENES commands', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:GFXSCENES': ['list_ex:GFXSCENES=', 'GFXSCENES.Test', ''],
					'list_ex:GFXSCENES.Test': ['list_ex:GFXSCENES.Test=', ''],
					'GFXSCENES.Test.resolution': ['GFXSCENES.Test.resolution=1920x1080'],
					'GFXSCENES.Test.resolution=1280x720': ['OK'],
					'GFXSCENES.Test.Renderer.width': ['GFXSCENES.Test.Renderer.width=1920'],
					'GFXSCENES.Test.Renderer.height': ['GFXSCENES.Test.Renderer.height=1080'],
					'GFXSCENES.Test.Renderer.position': ['GFXSCENES.Test.Renderer.position=0/0'],
					'GFXSCENES.Test.Renderer.url': ['GFXSCENES.Test.Renderer.url=https://www.nrk.no/'],
					'GFXSCENES.Test.Renderer.url=https://10.0.0.1/test': ['OK'],
					'GFXSCENES.Test.Renderer.width=100': ['OK'],
					'GFXSCENES.Test.Renderer.height=200': ['OK'],
					'GFXSCENES.Test.Renderer.position=10/20': ['OK'],
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})
			expect(await connection.listGfxScenes()).toStrictEqual([
				{
					realm: 'gfxScene',
					scenePath: ['Test'],
					name: 'Test',
				} satisfies GfxSceneRef & {
					name: string
				},
			])
			expect(await connection.getGfxScene(refGfxScene(['Test']))).toStrictEqual({
				resolution: SceneResolution.Resolution1920x1080,
			} satisfies GfxSceneObject)
			expect(
				await connection.updateGfxScene(refGfxScene(['Test']), {
					resolution: SceneResolution.Resolution1280x720,
				})
			).toBeUndefined()
			expect(await connection.getGfxSceneItem(refGfxSceneItem(refGfxScene(['Test']), ['Renderer']))).toStrictEqual({
				height: 1080,
				width: 1920,
				position: {
					x: 0,
					y: 0,
				},
			} satisfies GfxSceneItemObject)
			expect(
				await connection.updateGfxSceneItem(refGfxSceneItem(refGfxScene(['Test']), ['Renderer']), {
					height: 200,
					width: 100,
					position: {
						x: 10,
						y: 20,
					},
				})
			).toBeUndefined()
			expect(
				await connection.getGfxSceneHTMLElementItem(refGfxSceneItem(refGfxScene(['Test']), ['Renderer']))
			).toStrictEqual({
				height: 1080,
				width: 1920,
				position: {
					x: 0,
					y: 0,
				},
				url: 'https://www.nrk.no/',
			} satisfies GfxSceneHTMLElementItemObject)
			expect(
				await connection.updateGfxSceneHTMLElementItem(refGfxSceneItem(refGfxScene(['Test']), ['Renderer']), {
					url: 'https://10.0.0.1/test',
				})
			).toBeUndefined()
		})
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

	describe('subscriptions', () => {
		const refMain = refScene(['Main'])

		test('subscribeSceneLayer', async () => {
			const mockCallback = vi.fn()
			const abortController = new AbortController()

			const testLayerRef = refSceneLayer(refMain, ['Background'])
			const testLayerPath = 'SCENES.Main.Layers.Background'

			// Track subscribed paths and their callbacks
			const subscriptions = new Map<string, (path: string, error: Error | null, value: string | null) => void>()

			// Mock subscribeValue to simulate successful subscriptions
			connection.mockSetSubscribeValue((path: string, _abort: AbortSignal, callback: any) => {
				subscriptions.set(path, callback)

				// Simulate immediate responses with test data
				setTimeout(() => {
					const responses: Record<string, string> = {
						[`${testLayerPath}.opacity`]: '0.75',
						[`${testLayerPath}.sourceA`]: 'BLACK',
						[`${testLayerPath}.sourceB`]: 'WHITE',
						[`${testLayerPath}.source_pgm`]: 'BLACK',
						[`${testLayerPath}.source_pst`]: 'WHITE',
						[`${testLayerPath}.active_bus`]: 'A-Bus',
						[`${testLayerPath}.pgm_pst_mode`]: 'Swap',
						[`${testLayerPath}.sourceOptions`]: 'BLACK,CP1,CP2',
						[`${testLayerPath}.state`]: 'On',
						[`${testLayerPath}.mode`]: 'FitScene',
						[`${testLayerPath}.fxEnabled`]: '1',
						[`${testLayerPath}.preset_enabled`]: '1',
						[`${testLayerPath}.color`]: 'rgb(255,128,64)',
						[`${testLayerPath}.clean_mask`]: '1',
						[`${testLayerPath}.source_clean_mask`]: '2',
						[`${testLayerPath}.dissolve_enabled`]: '0',
						[`${testLayerPath}.dissolve_time`]: '1000',
						[`${testLayerPath}.dissolve_mode`]: 'Normal',
						[`${testLayerPath}.blend_mode`]: 'Normal',
					}

					const value = responses[path]
					if (value !== undefined) {
						callback(path, null, value)
					}
				}, 0)
			})

			// Start subscription
			connection.subscribeSceneLayer(testLayerRef, abortController.signal, mockCallback)

			// Process async operations
			await vi.runOnlyPendingTimersAsync()

			// Callback should be called with complete SceneLayerObject
			expect(mockCallback).toHaveBeenCalledWith(null, {
				opacity: 0.75,
				sourceA: refSourceBase(['BLACK']),
				sourceB: refSourceBase(['WHITE']),
				sourcePgm: refSourceBase(['BLACK']),
				sourcePst: refSourceBase(['WHITE']),
				activeBus: SceneLayerActiveBus.ABus,
				pgmPstMode: SceneLayerPgmPstMode.Swap,
				sourceOptions: [refSourceBase(['BLACK']), refClipPlayer(['CP1']), refClipPlayer(['CP2'])],
				state: SceneLayerState.On,
				mode: SceneLayerMode.FitScene,
				fxEnabled: true,
				presetEnabled: true,
				color: { red: 255, green: 128, blue: 64 },
				cleanMask: 1,
				sourceCleanMask: 2,
				dissolveEnabled: false,
				dissolveTime: 1000,
				dissolveMode: SceneLayerDissolveMode.Normal,
				blendMode: SceneLayerBlendMode.Normal,
			})
			expect(mockCallback).toHaveBeenCalledTimes(1)

			// Verify all expected attributes were subscribed to
			expect(subscriptions.size).toBe(19) // Number of attributes in SceneLayerObject
		})
	})
})
