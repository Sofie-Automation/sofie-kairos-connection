import { describe, test, expect } from 'vitest'
import {
	pathRoRef,
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
	SourceBaseRef,
	SourceIntRef,
	MattesRef,
	NDIOutputSettingRef,
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
	describe('pathRoRef', () => {
		test('SceneRef', () => {
			expect(pathRoRef('SCENES.Templates.2Box&#46;1')).toStrictEqual({
				realm: 'scene',
				scenePath: ['Templates', '2Box.1'],
			} satisfies SceneRef)

			expect(pathRoRef('SCENES.Main')).toStrictEqual({
				realm: 'scene',
				scenePath: ['Main'],
			} satisfies SceneRef)
		})
		test('SceneLayerRef', () => {
			expect(pathRoRef('SCENES.Main.Layers.LayerGroup')).toStrictEqual({
				realm: 'scene-layer',
				scenePath: ['Main'],
				layerPath: ['LayerGroup'],
			} satisfies SceneLayerRef)

			expect(pathRoRef('SCENES.Templates.2Box.Layers.Layer1.Layer2')).toStrictEqual({
				realm: 'scene-layer',
				scenePath: ['Templates', '2Box'],
				layerPath: ['Layer1', 'Layer2'],
			} satisfies SceneLayerRef)
		})

		test('SceneLayerEffectRef', () => {
			expect(pathRoRef('SCENES.Main.Layers.LayerGroup.Effects.Crop')).toStrictEqual({
				realm: 'scene-layer-effect',
				scenePath: ['Main'],
				layerPath: ['LayerGroup'],
				effectPath: ['Crop'],
			} satisfies SceneLayerEffectRef)

			expect(pathRoRef('SCENES.Scene1.Layers.Layer1.Effects.Transform2D')).toStrictEqual({
				realm: 'scene-layer-effect',
				scenePath: ['Scene1'],
				layerPath: ['Layer1'],
				effectPath: ['Transform2D'],
			} satisfies SceneLayerEffectRef)
		})

		test('MediaClipRef', () => {
			expect(pathRoRef('MEDIA.clips.video1&#46;mov')).toStrictEqual({
				realm: 'media-clip',
				clipPath: ['video1.mov'],
			} satisfies MediaClipRef)

			expect(pathRoRef('MEDIA.clips.folder.video2&#46;mp4')).toStrictEqual({
				realm: 'media-clip',
				clipPath: ['folder', 'video2.mp4'],
			} satisfies MediaClipRef)
		})

		test('MediaStillRef', () => {
			expect(pathRoRef('MEDIA.stills.image1&#46;jpg')).toStrictEqual({
				realm: 'media-still',
				clipPath: ['image1.jpg'],
			} satisfies MediaStillRef)

			expect(pathRoRef('MEDIA.stills.folder.image2&#46;png')).toStrictEqual({
				realm: 'media-still',
				clipPath: ['folder', 'image2.png'],
			} satisfies MediaStillRef)
		})

		test('MediaRamRecRef', () => {
			expect(pathRoRef('MEDIA.ramrec.recording1&#46;rr')).toStrictEqual({
				realm: 'media-ramrec',
				clipPath: ['recording1.rr'],
			} satisfies MediaRamRecRef)

			expect(pathRoRef('MEDIA.ramrec.folder.recording2&#46;rr')).toStrictEqual({
				realm: 'media-ramrec',
				clipPath: ['folder', 'recording2.rr'],
			} satisfies MediaRamRecRef)
		})

		test('MediaImageRef', () => {
			expect(pathRoRef('MEDIA.images.photo1&#46;png')).toStrictEqual({
				realm: 'media-image',
				clipPath: ['photo1.png'],
			} satisfies MediaImageRef)

			expect(pathRoRef('MEDIA.images.graphics.logo&#46;svg')).toStrictEqual({
				realm: 'media-image',
				clipPath: ['graphics', 'logo.svg'],
			} satisfies MediaImageRef)
		})

		test('MediaSoundRef', () => {
			expect(pathRoRef('MEDIA.sounds.audio1&#46;wav')).toStrictEqual({
				realm: 'media-sound',
				clipPath: ['audio1.wav'],
			} satisfies MediaSoundRef)

			expect(pathRoRef('MEDIA.sounds.music.song&#46;mp3')).toStrictEqual({
				realm: 'media-sound',
				clipPath: ['music', 'song.mp3'],
			} satisfies MediaSoundRef)
		})

		test('SceneTransitionRef', () => {
			expect(pathRoRef('SCENES.Main.Transitions.Transition1')).toStrictEqual({
				realm: 'scene-transition',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
			} satisfies SceneTransitionRef)

			expect(pathRoRef('SCENES.Scene1.Transitions.FadeTransition')).toStrictEqual({
				realm: 'scene-transition',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
			} satisfies SceneTransitionRef)
		})

		test('SceneTransitionMixRef', () => {
			expect(pathRoRef('SCENES.Main.Transitions.Transition1.BgdMix')).toStrictEqual({
				realm: 'scene-transition-mix',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
				mixPath: ['BgdMix'],
			} satisfies SceneTransitionMixRef)

			expect(pathRoRef('SCENES.Scene1.Transitions.FadeTransition.Mix1')).toStrictEqual({
				realm: 'scene-transition-mix',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
				mixPath: ['Mix1'],
			} satisfies SceneTransitionMixRef)
		})

		test('SceneTransitionMixEffectRef', () => {
			expect(pathRoRef('SCENES.Main.Transitions.Transition1.BgdMix.Effect1')).toStrictEqual({
				realm: 'scene-transition-mix-effect',
				scenePath: ['Main'],
				transitionPath: ['Transition1'],
				mixPath: ['BgdMix'],
				effectPath: ['Effect1'],
			} satisfies SceneTransitionMixEffectRef)

			expect(pathRoRef('SCENES.Scene1.Transitions.FadeTransition.Mix1.TransitionEffect')).toStrictEqual({
				realm: 'scene-transition-mix-effect',
				scenePath: ['Scene1'],
				transitionPath: ['FadeTransition'],
				mixPath: ['Mix1'],
				effectPath: ['TransitionEffect'],
			} satisfies SceneTransitionMixEffectRef)
		})

		test('SceneSnapshotRef', () => {
			expect(pathRoRef('SCENES.Main.Snapshots.SNP1')).toStrictEqual({
				realm: 'scene-snapshot',
				scenePath: ['Main'],
				snapshotPath: ['SNP1'],
			} satisfies SceneSnapshotRef)

			expect(pathRoRef('SCENES.Scene1.Snapshots.MySnapshot')).toStrictEqual({
				realm: 'scene-snapshot',
				scenePath: ['Scene1'],
				snapshotPath: ['MySnapshot'],
			} satisfies SceneSnapshotRef)
		})

		test('MacroRef', () => {
			expect(pathRoRef('MACROS.Macro1')).toStrictEqual({
				realm: 'macro',
				macroPath: ['Macro1'],
			} satisfies MacroRef)

			expect(pathRoRef('MACROS.Group.StartShow')).toStrictEqual({
				realm: 'macro',
				macroPath: ['Group', 'StartShow'],
			} satisfies MacroRef)
		})

		test('RamRecorderRef', () => {
			expect(pathRoRef('RR1')).toStrictEqual({
				realm: 'ramRecorder',
				playerIndex: 1,
			} satisfies RamRecorderRef)

			expect(pathRoRef('RR8')).toStrictEqual({
				realm: 'ramRecorder',
				playerIndex: 8,
			} satisfies RamRecorderRef)
		})

		test('ClipPlayerRef', () => {
			expect(pathRoRef('CP1')).toStrictEqual({
				realm: 'clipPlayer',
				playerIndex: 1,
			} satisfies ClipPlayerRef)

			expect(pathRoRef('CP2')).toStrictEqual({
				realm: 'clipPlayer',
				playerIndex: 2,
			} satisfies ClipPlayerRef)
		})

		test('ImageStoreRef', () => {
			expect(pathRoRef('IS1')).toStrictEqual({
				realm: 'imageStore',
				storeIndex: 1,
			} satisfies ImageStoreRef)

			expect(pathRoRef('IS8')).toStrictEqual({
				realm: 'imageStore',
				storeIndex: 8,
			} satisfies ImageStoreRef)
		})

		test('SourceBaseRef', () => {
			expect(pathRoRef('BLACK')).toStrictEqual({
				realm: 'source-base',
				path: ['BLACK'],
			} satisfies SourceBaseRef)

			expect(pathRoRef('WHITE')).toStrictEqual({
				realm: 'source-base',
				path: ['WHITE'],
			} satisfies SourceBaseRef)
		})

		test('SourceIntRef', () => {
			expect(pathRoRef('INTSOURCES.ColorBar')).toStrictEqual({
				realm: 'source-int',
				path: ['ColorBar'],
			} satisfies SourceIntRef)

			expect(pathRoRef('INTSOURCES.ColorCircle')).toStrictEqual({
				realm: 'source-int',
				path: ['ColorCircle'],
			} satisfies SourceIntRef)

			expect(pathRoRef('INTSOURCES.MV1')).toStrictEqual({
				realm: 'source-int',
				path: ['MV1'],
			} satisfies SourceIntRef)

			expect(pathRoRef('INTSOURCES.MV4')).toStrictEqual({
				realm: 'source-int',
				path: ['MV4'],
			} satisfies SourceIntRef)
		})

		test('MattesRef', () => {
			expect(pathRoRef('MATTES.Matte1')).toStrictEqual({
				realm: 'mattes',
				path: ['Matte1'],
			} satisfies MattesRef)

			expect(pathRoRef('MATTES.Group.CustomMatte')).toStrictEqual({
				realm: 'mattes',
				path: ['Group', 'CustomMatte'],
			} satisfies MattesRef)

			expect(pathRoRef('MATTES.Special&#46;Matte')).toStrictEqual({
				realm: 'mattes',
				path: ['Special.Matte'],
			} satisfies MattesRef)

			expect(pathRoRef('MATTES.Folder.Subfolder.AlphaMatte')).toStrictEqual({
				realm: 'mattes',
				path: ['Folder', 'Subfolder', 'AlphaMatte'],
			} satisfies MattesRef)
		})
		test('OUT_NDI', () => {
			expect(pathRoRef('OUT_NDI2')).toStrictEqual({
				realm: 'ndi-output-setting',
				ndiOutputSetting: 2,
			} satisfies NDIOutputSettingRef)
		})

		test('Unknown paths return original string', () => {
			expect(pathRoRef('UNKNOWN.path')).toBe('UNKNOWN.path')
			expect(pathRoRef('MEDIA.unknown.file')).toBe('MEDIA.unknown.file')
			expect(pathRoRef('RRx')).toBe('RRx') // Invalid RAM recorder
			expect(pathRoRef('RR0')).toBe('RR0') // Invalid RAM recorder
			expect(pathRoRef('CPx')).toBe('CPx') // Invalid clip player
			expect(pathRoRef('ISx')).toBe('ISx') // Invalid image store
		})
	})
})
