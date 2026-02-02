import { expect, test, describe, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { MockedKairosConnection } from './lib/MockMinimalKairosConnection.js'

import { KairosConnection } from '../main.js'
import { KairosRecorder } from './lib/kairos-recorder.js'
import { ExpectedResponseType } from '../minimal/parser.js'
import {
	refScene,
	refSourceBase,
	refStreamOutputSetting,
	StreamOutputSettingObject,
	StreamOutputSettingRef,
	refAudioOutputSetting,
	AudioOutputSettingObject,
	AudioOutputSettingRef,
	BitDepth,
	ColorModel,
	FrequencyEnum,
	IpOutputSettingObject,
	IpOutputSettingRef,
	refIpOutputSetting,
	SDPColorspace,
	SDPTcs,
	SceneLimitOffAction,
	refSceneTransition,
	Resolution,
	ProcessingFormat,
	SceneObject,
	AuxObject,
	refMatte,
	AuxRecordingStatus,
	refAuxId,
} from 'kairos-lib'

// Mock the MinimalKairosConnection class
const MockMinimalKairosConnection = await vi.hoisted(async () => {
	const { getMockMinimalKairosConnection } = await import('./lib/MockMinimalKairosConnection.js')

	return getMockMinimalKairosConnection()
})

vi.mock('../minimal/kairos-minimal.js', async (importOriginal) => {
	const original: typeof import('../minimal/kairos-minimal.js') = await importOriginal()
	return {
		...original,
		MinimalKairosConnection: MockMinimalKairosConnection.getClass(original.MinimalKairosConnection),
		OriginalMinimalKairosConnection: original.MinimalKairosConnection,
	}
})

// These tests ensure that we don't crash if we communicate with a Kairos 1.7 device.
// The mocked data in this file represents how a 1.7 device would respond.
describe('KairosConnection 1.7', () => {
	let connection: MockedKairosConnection

	let emulatorConnection: KairosRecorder | null

	beforeAll(async () => {
		// setupMock()

		if (process.env.KAIROS_EMULATOR_IP) {
			console.log('Using Kairos emulator at', process.env.KAIROS_EMULATOR_IP)
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

	describe('commands', () => {
		const refMain = refScene(['Main'])

		beforeEach(() => {
			connection = new KairosConnection() as unknown as MockedKairosConnection

			// Set up a default reply handler for the connection
			// That uses the stored responses from the Kairos emulator:
			connection.mockSetReplyHandler(
				async (
					message: string,
					expectedResponse: ExpectedResponseType,
					expectedResponsePath: string | null
				): Promise<string[]> => {
					if (emulatorConnection) {
						// If there is an emulatorConnection, use it to handle the command:
						const reply = await emulatorConnection.doCommand(message, expectedResponse, expectedResponsePath)
						if (reply !== null) return reply
					}
					throw new Error(`Unexpected message: ${message}`)
				}
			)
		})

		test('SCENES', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
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
					'SCENES.Main.processing_format': ['Error'], // Not supported in 1.7
				}[message]
				if (reply) {
					return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

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
				keyPreview: null,
				limitOffAction: SceneLimitOffAction.None,
				limitReturnTime: 20,
				nextTransition: [refSceneTransition(refMain, ['BgdMix'])],
				resolution: Resolution.Resolution1920x1080,
				resolutionX: 1920,
				resolutionY: 1080,
				tally: 3,
				processingFormat: ProcessingFormat.Default,
			} satisfies SceneObject)
		})

		test('STREAMOUTS', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:STREAMOUTS': ['list_ex:STREAMOUTS=', 'OUT_STREAM1', 'OUT_STREAM2', 'OUT_STREAM3', 'OUT_STREAM4', ''],
					'OUT_STREAM1.status': ['OUT_STREAM1.status=3'],
					'OUT_STREAM1.status_text': ['OUT_STREAM1.status_text=disabled'],
					'OUT_STREAM1.delay': ['OUT_STREAM1.delay=5'],
					'OUT_STREAM1.delay=5': ['OK'],
					'OUT_STREAM1.compare': ['Error'], // Not supported in 1.7
				}[message]
				if (reply) {
					return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			const outputs: StreamOutputSettingRef[] = []
			for (let i = 1; i <= 4; i++) {
				outputs.push(refStreamOutputSetting(i))
			}
			expect(await connection.listStreamOutputSettings()).toStrictEqual(outputs)

			expect(await connection.getStreamOutputSetting(refStreamOutputSetting(1))).toStrictEqual({
				status: 3,
				statusText: 'disabled',
				delay: 5,
				compare: '<unknown>', // Default value, not supported in 1.7
			} satisfies StreamOutputSettingObject)

			expect(
				await connection.updateStreamOutputSetting(refStreamOutputSetting(1), {
					delay: 5,
				})
			).toBeUndefined()
		})

		test('AUDIOOUTS', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:AUDIOOUTS': [
						'list_ex:AUDIOOUTS=',
						'OUT_AUDIO1',
						'OUT_AUDIO2',
						'OUT_AUDIO3',
						'OUT_AUDIO4',
						'OUT_AUDIO5',
						'OUT_AUDIO6',
						'OUT_AUDIO7',
						'OUT_AUDIO8',
						'',
					],
					'OUT_AUDIO1.status': ['OUT_AUDIO1.status=3'],
					'OUT_AUDIO1.status_text': ['OUT_AUDIO1.status_text=disabled'],
					'OUT_AUDIO1.delay': ['OUT_AUDIO1.delay=0'],
					'OUT_AUDIO1.delay=5': ['OK'],
				}[message]
				if (reply) {
					return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			const outputs: AudioOutputSettingRef[] = []
			for (let i = 1; i <= 8; i++) {
				outputs.push(refAudioOutputSetting(i))
			}
			expect(await connection.listAudioOutputSettings()).toStrictEqual(outputs)

			expect(await connection.getAudioOutputSetting(refAudioOutputSetting(1))).toStrictEqual({
				status: 3,
				statusText: 'disabled',
				delay: 0,
			} satisfies AudioOutputSettingObject)

			expect(
				await connection.updateAudioOutputSetting(refAudioOutputSetting(1), {
					delay: 5,
				})
			).toBeUndefined()
		})
		test('IPOUTS', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'list_ex:IPOUTS': [
						'list_ex:IPOUTS=',
						'OUT_IP1',
						'OUT_IP2',
						'OUT_IP3',
						'OUT_IP4',
						'OUT_IP5',
						'OUT_IP6',
						'OUT_IP7',
						'OUT_IP8',
						'OUT_IP9',
						'OUT_IP10',
						'OUT_IP11',
						'OUT_IP12',
						'OUT_IP13',
						'OUT_IP14',
						'OUT_IP15',
						'OUT_IP16',
						'OUT_IP17',
						'OUT_IP18',
						'OUT_IP19',
						'OUT_IP20',
						'OUT_IP21',
						'OUT_IP22',
						'OUT_IP23',
						'OUT_IP24',
						'OUT_IP25',
						'OUT_IP26',
						'OUT_IP27',
						'OUT_IP28',
						'OUT_IP29',
						'OUT_IP30',
						'OUT_IP31',
						'OUT_IP32',
						'',
					],
					'OUT_IP1.status': ['OUT_IP1.status=3'],
					'OUT_IP1.status_text': ['OUT_IP1.status_text=disabled'],
					'OUT_IP1.delay': ['OUT_IP1.delay=5'],
					'OUT_IP1.delay=5': ['OK'],
					'OUT_IP1.format': ['Error'], // Not supported in 1.7
					'OUT_IP1.frequency': ['Error'], // Not supported in 1.7
					'OUT_IP1.color_model': ['Error'], // Not supported in 1.7
					'OUT_IP1.bitdepth': ['Error'], // Not supported in 1.7
					'OUT_IP1.SDP_Colorspace': ['Error'], // Not supported in 1.7
					'OUT_IP1.SDP_Tcs': ['Error'], // Not supported in 1.7
					'OUT_IP1.compare': ['Error'], // Not supported in 1.7
				}[message]
				if (reply) {
					return reply
				}

				throw new Error(`Unexpected message: ${message}`)
			})

			const inputs: IpOutputSettingRef[] = []
			for (let i = 1; i <= 32; i++) {
				inputs.push(refIpOutputSetting(i))
			}
			expect(await connection.listIpOutputSettings()).toStrictEqual(inputs)

			expect(await connection.getIpOutputSetting(refIpOutputSetting(1))).toStrictEqual({
				SDPColorspace: SDPColorspace.NOT_SUPPORTED,
				SDPTcs: SDPTcs.NOT_SUPPORTED,
				bitDepth: BitDepth.NOT_SUPPORTED,
				colorModel: ColorModel.NOT_SUPPORTED,
				compare: '<unknown>',
				delay: 5,
				format: '',
				frequency: FrequencyEnum.NOT_SUPPORTED,
				status: 3,
				statusText: 'disabled',
			} satisfies IpOutputSettingObject)

			expect(
				await connection.updateIpOutputSetting(refIpOutputSetting(1), {
					delay: 5,
				})
			).toBeUndefined()
		})
		test('AUX', async () => {
			connection.mockSetReplyHandler(async (message: string): Promise<string[]> => {
				const reply = {
					'IP-AUX1.recording_status': ['IP-AUX1.recording_status=idle'],
					'IP-AUX1.name': ['IP-AUX1.name=Test name'],
					'IP-AUX1.available': ['IP-AUX1.available=0'],
					'IP-AUX1.sourceOptions': ['IP-AUX1.sourceOptions=MATTES.ColA,MATTES.ColB,MATTES.ColC,'],
					'IP-AUX1.source': ['IP-AUX1.source=WHITE'],
					'IP-AUX1.tally_root': ['IP-AUX1.tally_root=1'],
					'IP-AUX1.processing_format': ['Error'], // Not supported in 1.7
				}[message]
				if (reply) return reply

				throw new Error(`Unexpected message: ${message}`)
			})

			expect(await connection.getAux(refAuxId('IP-AUX1'))).toStrictEqual({
				recordingStatus: AuxRecordingStatus.Idle,
				name: 'Test name',
				available: false,
				sourceOptions: [refMatte(['ColA']), refMatte(['ColB']), refMatte(['ColC'])],
				source: refSourceBase(['WHITE']),
				tallyRoot: 1,
				processingFormat: ProcessingFormat.Default,
			} satisfies AuxObject)
		})
	})
})
