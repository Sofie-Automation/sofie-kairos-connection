import { describe, test, expect } from 'vitest'
import {
	pathToRef,
	splitPath,
	SceneRef,
	SceneLayerRef,
	SceneLayerEffectRef,
	MediaClipRef,
	MediaStillRef,
	MediaRamRecRef,
	MediaImageRef,
	MediaSoundRef,
	SceneTransitionRef,
	SceneTransitionMixRef,
	SceneTransitionMixEffectRef,
	SceneSnapshotRef,
	MacroRef,
	RamRecorderRef,
	ClipPlayerRef,
	ImageStoreRef,
	AudioPlayerRef,
	SourceBaseRef,
	SourceIntRef,
	SourceIntMVRef,
	GfxChannelRef,
	GfxSceneRef,
	AudioMixerChannelRef,
	MatteRef,
	AuxRef,
	AuxEffectRef,
	FxInputRef,
	IpInputRef,
	SDIInputRef,
	NDIInputRef,
	StreamInputRef,
	IpInputSettingRef,
	SDIInputSettingRef,
	NDIInputSettingRef,
	StreamInputSettingRef,
	IpOutputSettingRef,
	SDIOutputSettingRef,
	NDIOutputSettingRef,
	StreamOutputSettingRef,
	AudioOutputSettingRef,
} from '../reference.js'

describe('Reference', () => {
	test('splitPath', () => {
		expect(splitPath([])).toStrictEqual([[]])

		expect(splitPath(['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'])).toStrictEqual([
			['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'],
		])

		expect(splitPath(['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'], 'Layers')).toStrictEqual([
			['SCENES', 'Scene1'],
			['LayerGroup', 'Layer1'],
		])

		expect(splitPath(['SCENES', 'Scene1', 'Layers'], 'Layers')).toStrictEqual([['SCENES', 'Scene1'], []])

		expect(splitPath(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 'c', 'h')).toStrictEqual([
			['a', 'b'],
			['d', 'e', 'f', 'g'],
			['i', 'j'],
		])
	})
})

describe('ref conversions', () => {
	describe('pathToRef', () => {
		test('SceneRef', () => {
			expect(pathToRef('SCENES.Templates.2Box&#46;1')).toStrictEqual({
				realm: 'scene',
				scenePath: ['Templates', '2Box.1'],
			} satisfies SceneRef)

			expect(pathToRef('SCENES.Main')).toStrictEqual({
				realm: 'scene',
				scenePath: ['Main'],
			} satisfies SceneRef)
		})
		test('SceneLayerRef', () => {
			expect(pathToRef('SCENES.Main.Layers.LayerGroup')).toStrictEqual({
				realm: 'scene-layer',
				scenePath: ['Main'],
				layerPath: ['LayerGroup'],
			} satisfies SceneLayerRef)

			expect(pathToRef('SCENES.Templates.2Box.Layers.Layer1.Layer2')).toStrictEqual({
				realm: 'scene-layer',
				scenePath: ['Templates', '2Box'],
				layerPath: ['Layer1', 'Layer2'],
			} satisfies SceneLayerRef)
		})

		test('SceneLayerEffectRef', () => {
			expect(pathToRef('SCENES.Main.Layers.LayerGroup.Effects.Crop')).toStrictEqual({
				realm: 'scene-layer-effect',
				scenePath: ['Main'],
				layerPath: ['LayerGroup'],
				effectPath: ['Crop'],
			} satisfies SceneLayerEffectRef)

			expect(pathToRef('SCENES.Scene1.Layers.Layer1.Effects.Transform2D')).toStrictEqual({
				realm: 'scene-layer-effect',
				scenePath: ['Scene1'],
				layerPath: ['Layer1'],
				effectPath: ['Transform2D'],
			} satisfies SceneLayerEffectRef)
		})

		test('MediaClipRef', () => {
			expect(pathToRef('MEDIA.clips.video1&#46;mov')).toStrictEqual({
				realm: 'media-clip',
				clipPath: ['video1.mov'],
			} satisfies MediaClipRef)

			expect(pathToRef('MEDIA.clips.folder.video2&#46;mp4')).toStrictEqual({
				realm: 'media-clip',
				clipPath: ['folder', 'video2.mp4'],
			} satisfies MediaClipRef)
		})

		test('MediaStillRef', () => {
			expect(pathToRef('MEDIA.stills.image1&#46;jpg')).toStrictEqual({
				realm: 'media-still',
				clipPath: ['image1.jpg'],
			} satisfies MediaStillRef)

			expect(pathToRef('MEDIA.stills.folder.image2&#46;png')).toStrictEqual({
				realm: 'media-still',
				clipPath: ['folder', 'image2.png'],
			} satisfies MediaStillRef)
		})

		test('MediaRamRecRef', () => {
			expect(pathToRef('MEDIA.ramrec.recording1&#46;rr')).toStrictEqual({
				realm: 'media-ramrec',
				clipPath: ['recording1.rr'],
			} satisfies MediaRamRecRef)

			expect(pathToRef('MEDIA.ramrec.folder.recording2&#46;rr')).toStrictEqual({
				realm: 'media-ramrec',
				clipPath: ['folder', 'recording2.rr'],
			} satisfies MediaRamRecRef)
		})

		test('MediaImageRef', () => {
			expect(pathToRef('MEDIA.images.photo1&#46;png')).toStrictEqual({
				realm: 'media-image',
				clipPath: ['photo1.png'],
			} satisfies MediaImageRef)

			expect(pathToRef('MEDIA.images.graphics.logo&#46;svg')).toStrictEqual({
				realm: 'media-image',
				clipPath: ['graphics', 'logo.svg'],
			} satisfies MediaImageRef)
		})

		test('MediaSoundRef', () => {
			expect(pathToRef('MEDIA.sounds.audio1&#46;wav')).toStrictEqual({
				realm: 'media-sound',
				clipPath: ['audio1.wav'],
			} satisfies MediaSoundRef)

			expect(pathToRef('MEDIA.sounds.music.song&#46;mp3')).toStrictEqual({
				realm: 'media-sound',
				clipPath: ['music', 'song.mp3'],
			} satisfies MediaSoundRef)
		})

		test('SceneTransitionRef', () => {
			expect(pathToRef('SCENES.Main.Transitions.Transition1')).toStrictEqual({
				realm: 'scene-transition',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
			} satisfies SceneTransitionRef)

			expect(pathToRef('SCENES.Scene1.Transitions.FadeTransition')).toStrictEqual({
				realm: 'scene-transition',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
			} satisfies SceneTransitionRef)
		})

		test('SceneTransitionMixRef', () => {
			expect(pathToRef('SCENES.Main.Transitions.Transition1.BgdMix')).toStrictEqual({
				realm: 'scene-transition-mix',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
				mixPath: ['BgdMix'],
			} satisfies SceneTransitionMixRef)

			expect(pathToRef('SCENES.Scene1.Transitions.FadeTransition.Mix1')).toStrictEqual({
				realm: 'scene-transition-mix',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
				mixPath: ['Mix1'],
			} satisfies SceneTransitionMixRef)
		})

		test('SceneTransitionMixEffectRef', () => {
			expect(pathToRef('SCENES.Main.Transitions.Transition1.BgdMix.Effect1')).toStrictEqual({
				realm: 'scene-transition-mix-effect',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
				mixPath: ['BgdMix'],
				effectPath: ['Effect1'],
			} satisfies SceneTransitionMixEffectRef)

			expect(pathToRef('SCENES.Scene1.Transitions.FadeTransition.Mix1.TransitionEffect')).toStrictEqual({
				realm: 'scene-transition-mix-effect',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
				mixPath: ['Mix1'],
				effectPath: ['TransitionEffect'],
			} satisfies SceneTransitionMixEffectRef)
		})

		test('SceneSnapshotRef', () => {
			expect(pathToRef('SCENES.Main.Snapshots.SNP1')).toStrictEqual({
				realm: 'scene-snapshot',
				scenePath: ['Main'],
				snapshotPath: ['SNP1'],
			} satisfies SceneSnapshotRef)

			expect(pathToRef('SCENES.Scene1.Snapshots.MySnapshot')).toStrictEqual({
				realm: 'scene-snapshot',
				scenePath: ['Scene1'],
				snapshotPath: ['MySnapshot'],
			} satisfies SceneSnapshotRef)
		})

		test('MacroRef', () => {
			expect(pathToRef('MACROS.Macro1')).toStrictEqual({
				realm: 'macro',
				macroPath: ['Macro1'],
			} satisfies MacroRef)

			expect(pathToRef('MACROS.Group.StartShow')).toStrictEqual({
				realm: 'macro',
				macroPath: ['Group', 'StartShow'],
			} satisfies MacroRef)
		})

		test('RamRecorderRef', () => {
			expect(pathToRef('RR1')).toStrictEqual({
				realm: 'ramRecorder',
				playerIndex: 1,
			} satisfies RamRecorderRef)

			expect(pathToRef('RR8')).toStrictEqual({
				realm: 'ramRecorder',
				playerIndex: 8,
			} satisfies RamRecorderRef)
		})

		test('ClipPlayerRef', () => {
			expect(pathToRef('CP1')).toStrictEqual({
				realm: 'clipPlayer',
				playerIndex: 1,
			} satisfies ClipPlayerRef)

			expect(pathToRef('CP2')).toStrictEqual({
				realm: 'clipPlayer',
				playerIndex: 2,
			} satisfies ClipPlayerRef)
		})

		test('ImageStoreRef', () => {
			expect(pathToRef('IS1')).toStrictEqual({
				realm: 'imageStore',
				storeIndex: 1,
			} satisfies ImageStoreRef)

			expect(pathToRef('IS8')).toStrictEqual({
				realm: 'imageStore',
				storeIndex: 8,
			} satisfies ImageStoreRef)
		})

		test('SourceBaseRef', () => {
			expect(pathToRef('BLACK')).toStrictEqual({
				realm: 'source-base',
				path: ['BLACK'],
			} satisfies SourceBaseRef)

			expect(pathToRef('WHITE')).toStrictEqual({
				realm: 'source-base',
				path: ['WHITE'],
			} satisfies SourceBaseRef)
		})

		test('SourceIntRef', () => {
			expect(pathToRef('INTSOURCES.ColorBar')).toStrictEqual({
				realm: 'source-int',
				path: ['ColorBar'],
			} satisfies SourceIntRef)

			expect(pathToRef('INTSOURCES.ColorCircle')).toStrictEqual({
				realm: 'source-int',
				path: ['ColorCircle'],
			} satisfies SourceIntRef)

			expect(pathToRef('INTSOURCES.MV1')).toStrictEqual({
				realm: 'mv-int',
				mvId: 1,
			} satisfies SourceIntMVRef)

			expect(pathToRef('INTSOURCES.MV4')).toStrictEqual({
				realm: 'mv-int',
				mvId: 4,
			} satisfies SourceIntMVRef)
		})

		test('MatteRef', () => {
			expect(pathToRef('MATTES.Matte1')).toStrictEqual({
				realm: 'matte',
				mattePath: ['Matte1'],
			} satisfies MatteRef)

			expect(pathToRef('MATTES.Group.CustomMatte')).toStrictEqual({
				realm: 'matte',
				mattePath: ['Group', 'CustomMatte'],
			} satisfies MatteRef)

			expect(pathToRef('MATTES.Special&#46;Matte')).toStrictEqual({
				realm: 'matte',
				mattePath: ['Special.Matte'],
			} satisfies MatteRef)

			expect(pathToRef('MATTES.Folder.Subfolder.AlphaMatte')).toStrictEqual({
				realm: 'matte',
				mattePath: ['Folder', 'Subfolder', 'AlphaMatte'],
			} satisfies MatteRef)
		})
		test('AudioPlayerRef', () => {
			expect(pathToRef('AP1')).toStrictEqual({
				realm: 'audio-player',
				playerIndex: 1,
			} satisfies AudioPlayerRef)

			expect(pathToRef('AP5')).toStrictEqual({
				realm: 'audio-player',
				playerIndex: 5,
			} satisfies AudioPlayerRef)
		})

		test('GfxChannelRef', () => {
			expect(pathToRef('GFX1')).toStrictEqual({
				realm: 'gfx-channel',
				gfxChannelIndex: 1,
			} satisfies GfxChannelRef)

			expect(pathToRef('GFX3')).toStrictEqual({
				realm: 'gfx-channel',
				gfxChannelIndex: 3,
			} satisfies GfxChannelRef)
		})

		test('GfxSceneRef', () => {
			expect(pathToRef('GFXSCENES.Scene1')).toStrictEqual({
				realm: 'gfxScene',
				scenePath: ['Scene1'],
			} satisfies GfxSceneRef)

			expect(pathToRef('GFXSCENES.Templates.Logo')).toStrictEqual({
				realm: 'gfxScene',
				scenePath: ['Templates', 'Logo'],
			} satisfies GfxSceneRef)
		})

		test('AuxRef', () => {
			expect(pathToRef('AUX.AUX1')).toStrictEqual({
				realm: 'aux',
				path: 'AUX1',
				pathIsName: true,
			} satisfies AuxRef)

			expect(pathToRef('HDMI-AUX1')).toStrictEqual({
				realm: 'aux',
				path: 'HDMI-AUX1',
				pathIsName: false,
			} satisfies AuxRef)

			expect(pathToRef('USB-AUX2')).toStrictEqual({
				realm: 'aux',
				path: 'USB-AUX2',
				pathIsName: false,
			} satisfies AuxRef)
		})

		test('IpInputRef', () => {
			expect(pathToRef('IP1')).toStrictEqual({
				realm: 'ip-input',
				ipInput: 1,
			} satisfies IpInputRef)

			expect(pathToRef('IP10')).toStrictEqual({
				realm: 'ip-input',
				ipInput: 10,
			} satisfies IpInputRef)
		})

		test('SDIInputRef', () => {
			expect(pathToRef('SDI1')).toStrictEqual({
				realm: 'sdi-input',
				sdiInput: 1,
			} satisfies SDIInputRef)

			expect(pathToRef('SDI8')).toStrictEqual({
				realm: 'sdi-input',
				sdiInput: 8,
			} satisfies SDIInputRef)
		})

		test('NDIInputRef', () => {
			expect(pathToRef('NDI1')).toStrictEqual({
				realm: 'ndi-input',
				ndiInput: 1,
			} satisfies NDIInputRef)

			expect(pathToRef('NDI4')).toStrictEqual({
				realm: 'ndi-input',
				ndiInput: 4,
			} satisfies NDIInputRef)
		})

		test('StreamInputRef', () => {
			expect(pathToRef('STREAM1')).toStrictEqual({
				realm: 'stream-input',
				streamInput: 1,
			} satisfies StreamInputRef)

			expect(pathToRef('STREAM3')).toStrictEqual({
				realm: 'stream-input',
				streamInput: 3,
			} satisfies StreamInputRef)
		})

		test('SourceIntRef - complete coverage', () => {
			expect(pathToRef('INTSOURCES.MV2')).toStrictEqual({
				realm: 'mv-int',
				mvId: 2,
			} satisfies SourceIntMVRef)

			expect(pathToRef('INTSOURCES.MV3')).toStrictEqual({
				realm: 'mv-int',
				mvId: 3,
			} satisfies SourceIntMVRef)
		})

		test('IpInputSettingRef', () => {
			expect(pathToRef('IN_IP1')).toStrictEqual({
				realm: 'ip-input-setting',
				ipInputSetting: 1,
			} satisfies IpInputSettingRef)

			expect(pathToRef('IN_IP5')).toStrictEqual({
				realm: 'ip-input-setting',
				ipInputSetting: 5,
			} satisfies IpInputSettingRef)
		})

		test('SDIInputSettingRef', () => {
			expect(pathToRef('IN_SDI1')).toStrictEqual({
				realm: 'sdi-input-setting',
				sdiInputSetting: 1,
			} satisfies SDIInputSettingRef)

			expect(pathToRef('IN_SDI8')).toStrictEqual({
				realm: 'sdi-input-setting',
				sdiInputSetting: 8,
			} satisfies SDIInputSettingRef)
		})

		test('NDIInputSettingRef', () => {
			expect(pathToRef('IN_NDI1')).toStrictEqual({
				realm: 'ndi-input-setting',
				ndiInputSetting: 1,
			} satisfies NDIInputSettingRef)

			expect(pathToRef('IN_NDI3')).toStrictEqual({
				realm: 'ndi-input-setting',
				ndiInputSetting: 3,
			} satisfies NDIInputSettingRef)
		})

		test('StreamInputSettingRef', () => {
			expect(pathToRef('IN_STREAM1')).toStrictEqual({
				realm: 'stream-input-setting',
				streamInputSetting: 1,
			} satisfies StreamInputSettingRef)

			expect(pathToRef('IN_STREAM2')).toStrictEqual({
				realm: 'stream-input-setting',
				streamInputSetting: 2,
			} satisfies StreamInputSettingRef)
		})

		test('IpOutputSettingRef', () => {
			expect(pathToRef('OUT_IP1')).toStrictEqual({
				realm: 'ip-output-setting',
				ipOutputSetting: 1,
			} satisfies IpOutputSettingRef)

			expect(pathToRef('OUT_IP4')).toStrictEqual({
				realm: 'ip-output-setting',
				ipOutputSetting: 4,
			} satisfies IpOutputSettingRef)
		})

		test('SDIOutputSettingRef', () => {
			expect(pathToRef('OUT_SDI1')).toStrictEqual({
				realm: 'sdi-output-setting',
				sdiOutputSetting: 1,
			} satisfies SDIOutputSettingRef)

			expect(pathToRef('OUT_SDI6')).toStrictEqual({
				realm: 'sdi-output-setting',
				sdiOutputSetting: 6,
			} satisfies SDIOutputSettingRef)
		})

		test('NDIOutputSettingRef', () => {
			expect(pathToRef('OUT_NDI1')).toStrictEqual({
				realm: 'ndi-output-setting',
				ndiOutputSetting: 1,
			} satisfies NDIOutputSettingRef)

			expect(pathToRef('OUT_NDI2')).toStrictEqual({
				realm: 'ndi-output-setting',
				ndiOutputSetting: 2,
			} satisfies NDIOutputSettingRef)
		})

		test('StreamOutputSettingRef', () => {
			expect(pathToRef('OUT_STREAM1')).toStrictEqual({
				realm: 'stream-output-setting',
				streamOutputSetting: 1,
			} satisfies StreamOutputSettingRef)

			expect(pathToRef('OUT_STREAM3')).toStrictEqual({
				realm: 'stream-output-setting',
				streamOutputSetting: 3,
			} satisfies StreamOutputSettingRef)
		})

		test('AudioOutputSettingRef', () => {
			expect(pathToRef('OUT_AUDIO1')).toStrictEqual({
				realm: 'audio-output-setting',
				audioOutputSetting: 1,
			} satisfies AudioOutputSettingRef)

			expect(pathToRef('OUT_AUDIO2')).toStrictEqual({
				realm: 'audio-output-setting',
				audioOutputSetting: 2,
			} satisfies AudioOutputSettingRef)
		})

		test('Unknown paths return original string', () => {
			expect(pathToRef('UNKNOWN.path')).toBe('UNKNOWN.path')
			expect(pathToRef('MEDIA.unknown.file')).toBe('MEDIA.unknown.file')
			expect(pathToRef('RRx')).toBe('RRx') // Invalid RAM recorder
			expect(pathToRef('RR0')).toBe('RR0') // Invalid RAM recorder
			expect(pathToRef('CPx')).toBe('CPx') // Invalid clip player
			expect(pathToRef('ISx')).toBe('ISx') // Invalid image store
			expect(pathToRef('APx')).toBe('APx') // Invalid audio player
			expect(pathToRef('AP0')).toBe('AP0') // Invalid audio player
			expect(pathToRef('GFXx')).toBe('GFXx') // Invalid GFX channel
			expect(pathToRef('GFX0')).toBe('GFX0') // Invalid GFX channel
			expect(pathToRef('IPx')).toBe('IPx') // Invalid IP input
			expect(pathToRef('IP0')).toBe('IP0') // Invalid IP input
			expect(pathToRef('SDIx')).toBe('SDIx') // Invalid SDI input
			expect(pathToRef('SDI0')).toBe('SDI0') // Invalid SDI input
			expect(pathToRef('NDIx')).toBe('NDIx') // Invalid NDI input
			expect(pathToRef('NDI0')).toBe('NDI0') // Invalid NDI input
			expect(pathToRef('STREAMx')).toBe('STREAMx') // Invalid stream input
			expect(pathToRef('STREAM0')).toBe('STREAM0') // Invalid stream input
		})

		test('AudioMixerChannelRef', () => {
			expect(pathToRef('AUDIOMIXER.Channel1')).toStrictEqual({
				realm: 'audioMixer-channel',
				channelPath: ['Channel1'],
			} satisfies AudioMixerChannelRef)

			expect(pathToRef('AUDIOMIXER.Group.MicChannel')).toStrictEqual({
				realm: 'audioMixer-channel',
				channelPath: ['Group', 'MicChannel'],
			} satisfies AudioMixerChannelRef)
		})

		test('FxInputRef', () => {
			expect(pathToRef('FXINPUTS.Input1')).toStrictEqual({
				realm: 'fxInput',
				fxInputPath: ['Input1'],
			} satisfies FxInputRef)

			expect(pathToRef('FXINPUTS.Group.SpecialInput')).toStrictEqual({
				realm: 'fxInput',
				fxInputPath: ['Group', 'SpecialInput'],
			} satisfies FxInputRef)
		})

		test('AuxEffectRef', () => {
			expect(pathToRef('AUX.AUX1.Effects.Crop')).toStrictEqual({
				realm: 'aux-effect',
				auxPath: 'AUX1',
				auxPathIsName: true,
				effectPath: ['Crop'],
			} satisfies AuxEffectRef)

			expect(pathToRef('AUX.MainAux.Effects.Transform.Scale')).toStrictEqual({
				realm: 'aux-effect',
				auxPath: 'MainAux',
				auxPathIsName: true,
				effectPath: ['Transform', 'Scale'],
			} satisfies AuxEffectRef)
		})
	})
})
