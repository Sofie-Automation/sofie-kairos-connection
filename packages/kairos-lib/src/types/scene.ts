import { OmitReadonly } from '../lib/omit-readonly.js'
import { SceneTransitionRef, AnySourceRef, SceneLayerEffectRef } from '../lib/reference.js'
import { ColorRGB, DissolveMode, Resolution } from './lib-types.js'

export interface SceneObject {
	/**
	 * Enable or disable “Advanced resolution control” settings for individual X/Y Canvas
	 * Size. This setting can be applied per Scene. The default setting is “Disabled” in
	 * which case the check box appears unticked.
	 */
	advancedResolutionControl: boolean

	/**
	 * When enabling the “Advanced resolution control” after unfolding the “Advanced”
	 * controls and tick the check box, the X - and Y-Resolution sliders allow to determine
	 * the individual resolution per Scene. This setting is independent from the selected
	 * sources within the Scene -internal sources as well as external sources, and from
	 * the designated outputs. In order to adjust the individual X/Y settings, the according
	 * slider, the numeric entry box or the arrow up/down icons can be used.
	 * [ integer, min: 16, max: 3840 ]
	 */
	readonly resolutionX: number

	/**
	 * When enabling the “Advanced resolution control” after unfolding the “Advanced”
	 * controls and tick the check box, the X - and Y-Resolution sliders allow to determine
	 * the individual resolution per Scene. This setting is independent from the selected
	 * sources within the Scene -internal sources as well as external sources, and from
	 * the designated outputs. In order to adjust the individual X/Y settings, the according
	 * slider, the numeric entry box or the arrow up/down icons can be used.
	 * [ integer, min: 10, max: 2160 ]
	 */
	readonly resolutionY: number

	/**
	 * Tally is monitoring if the selected Scene fulfills a certain predefined Tally condition,
	 * like for example:
	 * – Red for OnAir Tally
	 * – Yellow for Preview Tally
	 * – Green for Monitor Tally
	 * – Blue for Audience Tally
	 * – Magenta for Audio Source Tally
	 * – etc.
	 * In order to specify certain Tally conditions, select the “Aux” menu from the “Config”
	 * tray and configure the individual Aux outputs 1-16 to the desired Tally
	 * color/functionality. “Red” is default for “On Air” Tally and “Yellow” is default for
	 * Preview (PVW) Tally.
	 * [ integer ]
	 */
	readonly tally: number

	/**
	 * The “Color” setting allows the User to define a specific Scene color which is
	 * automatically applied to be used for the background color of the selected Scene.
	 * When clicking the area right next to the “Color” setting, a pop-up window allows to
	 * pick a color from the palette,“Pick Screen Color” or enter a HTML color code, RGB
	 * or HSL-values into the designated field. Also “Custom colors” can be saved within
	 * the pop-up dialog.
	 * @example rgb(255,0,0)
	 */
	color: ColorRGB

	/**
	 * The drop down menu next to “Resolution” allows to determine the designated
	 * Scene-Resolution. The selectable defaults are “1280x720p”, “1920x1080p” and
	 * “3840x2160”. */
	resolution: Resolution

	/** list[ObjectID] */
	nextTransition: SceneTransitionRef[]

	/** [ integer ,min: 0, max: 9999 ] */
	allDuration: number
	/** float  */
	allFader: number
	// /**
	//  * [ ObjectID ]
	//  *  TODO: Figure out what this is, what is this a reference to?
	//  * @deprecated Parsing of this property is not implemented, use with caution.
	//  */
	// nextTransitionType: string

	faderReverse: boolean
	faderSync: boolean

	/**  */
	limitOffAction: SceneLimitOffAction
	/** [ integer, min: 0, max: 9999 ] */
	limitReturnTime: number
	/** ObjectID  */
	keyPreview: SceneLayerEffectRef | null
}

export interface SceneLayerObject {
	/**
	 * The Opacity setting allows the User to adjust the Transparency level (opposite of
	 * Opacity) for the selected Layer. In order to adjust the level for Opacity, the
	 * according slider, the numeric entry box or the arrow up/down icons can be used.
	 * The control range for “Opacity” is from 0,00% to 100,00% and default is 100.00%.
	 * [ float, min: 0, max: 1 ]
	 */
	opacity: number

	/**
	 * Source A/B source selection allows the User to select a source for the appropriate
	 * bus, regardless if the source is already part of “Source Options” in this Layer and/or
	 * Background or not. Next to the Source A/B source selection items, the actual
	 * selected source is displayed. Clicking on the symbol (Pen) right next to the setting,
	 * will open the according Input selection menu to select from all available listed
	 * external as well as internal sources.
	 *
	 * Layers within Scenes can use any source, regardless if it
	 * derives straight from an input or an internal source such as Still Store, RamRecorder,
	 * Clip Player, Color Mattes, Black, White, Color-Bars, Color-Circle, Pre-processed Inputs
	 * (Fx-Inputs) or any other meanwhile existing Scene
	 * [ ObjectID ]
	 */
	sourceA: AnySourceRef

	/**
	 * Source A/B source selection allows the User to select a source for the appropriate
	 * bus, regardless if the source is already part of “Source Options” in this Layer and/or
	 * Background or not. Next to the Source A/B source selection items, the actual
	 * selected source is displayed. Clicking on the symbol (Pen) right next to the setting,
	 * will open the according Input selection menu to select from all available listed
	 * external as well as internal sources.
	 * [ ObjectID, read_only ]
	 */
	readonly sourceB: AnySourceRef | null

	/** [ ObjectID ] */
	sourcePgm: AnySourceRef
	/**
	 * [ ObjectID ] */
	sourcePst: AnySourceRef
	/**
	 * [ enum, read_only, min: 0, max: 1 ]
	 */
	readonly activeBus: SceneLayerActiveBus

	/**
	 * In “PGM/PST mode” the User can choose the behaviour for PGM/PST or A/B buses
	 * after next transition for Backgrounds and Layers (once “Preset enabled” is
	 * activated) based on 3 individual settings.
	 * In “PGM/PST mode” the User can choose the behaviour for PGM/PST or A/B buses
	 * after next transition for Backgrounds and Layers (once “Preset enabled” is
	 * activated) based on 3 individual settings. The different selections can be achieved
	 * by clicking the arrow down icon at the pull down menu next to the “PGM/PST mode”
	 * selection. Swap = is Default behaviour. The former PST/B-bus source becomes the
	 * PGM/A-bus source after the next transition. And PGM/A-bus becomes PST/B-bus
	 * source. Next = After the next transition the former PST/B-bus becomes PGM/A-bus,
	 * and the former PST/B-bus source will increase +1 according to the “Source
	 * Options” list. The intention is to mimic a “Studio Automation” system. However, the
	 * User always can do a temporary overwrite, simulating that the “Next Story” or in
	 * general the next source is not “Ready” yet. When the last PST/B-bus crosspoint is
	 * reached and taken to PGM/A-bus, there’s no automatic crosspoint change anymore
	 * and the sequence is stopped. Next+Loop = Is the same behaviour like described for
	 * “Next”, but after the final PST/B-bus crosspoint is reached and taken to PGM/A-bus,
	 * the PST/B-bus crosspoint will select the first listed source again and start to loop
	 * from the beginning. This sequence will loop/cycle endless until the User is changing
	 * the “PGM/PST mode” back to “Swap” or “Next”. Also in “Next+Loop” the User
	 * always can do a temporary overwrite in order to simulate that the “Next Story” or
	 * “Source” in general is not “Ready” yet.
	 * [ enum, min: 0, max: 3 ]
	 */
	pgmPstMode: SceneLayerPgmPstMode

	/**
	 * In “Source Options” the User can determine which sources in a specific Scene
	 * and/or Layer are relevant to the composite, and probably needs to be changeable
	 * on the fly in direct access.
	 * The function “Source Options” is available -apart from Layer settings- at various
	 * different locations within the system, and is responsible for the User specific
	 * customisation of direct accessible sources/crosspoints per A/B-bus. “Source
	 * Options” also can be applied to -for example- individual output destinations, such as
	 * Multiviewers and Aux-Out, etc. If B-Bus is enabled the available “Source Options”
	 * are equal to the selection made for A-Bus. For some buses it might be useful not
	 * having a single Source Option at all, like for instance the CG source -when only a
	 * single GFX system is available- there won’t be any other substitute or plan-B
	 * available, in case the main CG fails. However, in order to create a specific list of
	 * “Source Options”, click on the symbol (Pen) right next to the “Source Options” item,
	 * and the according pop-up menu task is started. Here single sources or groups of
	 * sources can be added and/or subtracted from the designated source option list.
	 * Also the order of appearance within the “Source Options” list can be edited.
	 * [ list[ObjectID] ] */
	sourceOptions: AnySourceRef[]

	/**
	 * [ enum, read_only, min: 0, max: 3 ]
	 */
	readonly state: SceneLayerState

	/**
	 * In “Mode” selection the User can choose how to affect a selected source in terms of
	 * size in order to fit into the actual Scene resolution (Canvas Size).
	 * Changing the “Mode” selection the User can determine to pre-process a selected
	 * source in terms of Size and Aspect Ratio to fit into the actual adjusted Scene
	 * resolution (Canvas Size). There are 4 settings available to select from by clicking
	 * the arrow down icon at the pull-down menu, next to the “Mode” selection. KeepSize
	 * = Source remains unaffected in terms of Size and Aspect Ratio. The source is
	 * presented center-cut within the Scene resolution settings. Aspect ratio in this case
	 * remains unaffected. However, if the source resolution is smaller than the actual
	 * Scene resolution, the uncovered Canvas area appears transparent. If the source
	 * resolution is larger than the targeted Scene resolution, the Canvas will crop the
	 * source accordingly in center-cut condition. FitScene = Will Auto-Size and AutoAspect the selected source in order to fit exactly into the targeted Scene resolution.
	 * Be aware of that this operational mode can cause unwanted geometric distortions,
	 * e.g. by stretching a selected source circle shape into an ellipse.
	 * FitSceneKeepAspect = This function will proportionally zoom the selected and
	 * center source until the left-right or top-bottom edge equals the Scene resolution
	 * without changing the source Aspect-Ratio. Again, an uncovered target area appears
	 * transparent in the actual Canvas. This method, unlike the “Fit Scene” mode,
	 * prevents from causing unwanted distortions to the selected source. Auto = is
	 * Default setting. This setting will auto-select the most appropriate mode from
	 * “KeepSize”, “FitScene” or “FitSceneKeepAspect” to start with.
	 * [ enum, min: 0, max: 3 ]
	 */
	mode: SceneLayerMode

	/**
	 * [ bool, read_only ]
	 */
	readonly fxEnabled: boolean

	/**
	 * The B-Bus can be enabled per Layer and Background Layer. Default for Layer =
	 * Disabled. Default for Background Layer = Enabled. When B-Bus is enabled the
	 * check box appears ticked.
	 * Enable the B-Bus on a Layer allows the User to apply A-B transtions (Mix, Wipe,
	 * DVE, etc.) like on PGM/PST without routing another Scene to the A-Bus source and
	 * performing the transition upstream. However, it is also valid to disable the B-Bus on
	 * Background Layer, since there’s probably/absolutely no need to perform any other
	 * transition apart from “Cut” in the created Scene. When B-Bus is enabled the check
	 * box appears ticked.
	 * [ bool ]
	 */
	presetEnabled: boolean

	/**
	 * The “Color” setting allows the User to define a specific color per Layer within the
	 * selected Scene. When clicking the area right next to the “Color” setting, a pop-up
	 * window allows to pick a color from the palette, Use “Pick Screen Color” or enter a
	 * HTML color code, RGB or HSL-values into the designated field. Also “Custom
	 * colors” can be saved within the pop-up dialog.
	 * @example rgb(255,0,0)
	 */
	color: ColorRGB

	/**
	 * The “Clean mask” selection allows to configure up to 8 different Clean Feed circuits
	 * per Layer, which later on can be applied as single or combined circuits to individual
	 * Aux-Output signals as well as individual Multiviewer-Outputs/tiles.
	 * When a specific Output configuration is needed where certain e.g. GFX elements
	 * are not supposed to be visible, the “Clean mask” setting will help to make the right
	 * adjustments. Here the User can determine a Bit-mask using Bit 1-8 in order to
	 * decide if the selected Layer is visible in the selected “Clean mask” or not - multi
	 * selections can be applied. Selecting a Bit within the mask will decide that -unlike the
	 * PGM-Out of the hosting Scene- this Layer won’t be visible on an Output where this
	 * Bit-Mask -in the designated Output menu (Aux, MV-Layout)- is enabled. An Output
	 * also has the ability to combine/cascade multiple Clean masks. The selection “none”
	 * indicates that the “Clean mask” for this Layer is disabled entirely. Clicking on the
	 * symbol (Pen) right next to the setting, will open the drop-down menu, where the
	 * individual Bits 1-8 can be selected for Clean Feed circuits. Again, multi selections
	 * can be applied. The “Clean mask” field is than indicating which “Clean mask” Bit is
	 * enabled e.g. “1,4,7”. Those Bits can also be unselected individually, or use the
	 * function “Clear” in the drop-down Menu in order to unselect all “Clean mask” Bits.
	 * [ integer ]
	 */
	cleanMask: number

	/**
	 * [ integer ]
	 */
	sourceCleanMask: number
	/**
	 * “Dissolve enabled” allows to do direct dissolves to the next selected source on the
	 * designated bus, whereby the dissolve type “Mix” is default. When function “Dissolve
	 * enabled” is activated, the check box appears ticked.
	 * [ bool ]
	 */
	dissolveEnabled: boolean
	/**
	 * The “Dissolve time” setting allows the user to set the transition duration rate for bus
	 * dissolve, used when “Dissolve enabled” is activated. The control range for “Dissolve
	 * time” is in frames, ranging from 0 to 100. Adjustments can be done using the
	 * according slider, the numeric entry box or the arrow up/down icons. Default = 50
	 * frames.
	 * [ integer, min: 0, max: 9999 ]
	 */
	dissolveTime: number

	/**
	 * When “Dissolve effect” other than “Mix” is selected, the transition type “Wipe”,
	 * “DVE” or “User” can be forced to run always in “Normal”, “Reverse” or “Cross”
	 * (Normal/Reverse) direction. The drop-down menu is used to make the required
	 * selection.
	 * [ enum ]
	 */
	dissolveMode: DissolveMode

	/**
	 * [ enum ]
	 */
	blendMode: SceneLayerBlendMode
}
export interface SceneTransitionObject {
	/**
	 * [ float, min: 0, max: 1 ]
	 */
	readonly progress: number
	/**
	 * [ integer, min: 0, max: 9999 ]
	 */
	readonly progressFrames: number
	/**
	 * [ integer, min: 0, max: 9999 ]
	 */
	duration: number
}
// export interface SceneTransitionMixObject {
// no properties
// }
export interface SceneTransitionMixEffectObject {
	curve: SceneCurve
	/** [ objectId ] */
	readonly effect: string
	effectName: string
}

export interface SceneSnapshotObject {
	/**
	 * [ enum, read_only ] */
	readonly status: SceneSnapshotStatus

	/**
	 * [ ColorRGB ]
	 */
	color: ColorRGB

	/**
	 * [ int, min: 0, max: 9999 ]
	 */
	dissolveTime: number

	enableCurve: boolean
	curve: SceneCurve

	/**
	 * [enum, min: 0, max: 2 ]
	 */
	priorityRecall: SceneSnapshotPriorityRecall
}

// ------------------------- enums -----------------------------
export enum SceneLimitOffAction {
	None = 'None',
	ToBegin = 'ToBegin',
	ToEnd = 'ToEnd',
}
export enum SceneLayerActiveBus {
	ABus = 'A-Bus',
	BBus = 'B-Bus',
}
export enum SceneLayerPgmPstMode {
	Swap = 'Swap',
	Next = 'Next',
	NextLoop = 'NextLoop',
	Follow = 'Follow',
}
export enum SceneLayerState {
	Off = 'Off',
	On = 'On',
	FadeIn = 'FadeIn',
	FadeOut = 'FadeOut',
}
export enum SceneLayerMode {
	FitScene = 'FitScene',
	FitSceneKeepAspect = 'FitSceneKeepAspect',
	KeepSize = 'KeepSize',
	Auto = 'Auto',
}
export enum SceneLayerBlendMode {
	Default = 'Default',
	Normal = 'Normal',
	Lighten = 'Lighten',
	Darken = 'Darken',
	Multiply = 'Multiply',
	Average = 'Average',
	Add = 'Add',
	Substract = 'Substract',
	Difference = 'Difference',
	Negation = 'Negation',
	Exclusion = 'Exclusion',
	Screen = 'Screen',
	Overlay = 'Overlay',
	SoftLight = 'SoftLight',
	HardLight = 'HardLight',
	ColorDodge = 'ColorDodge',
	ColorBurn = 'ColorBurn',
	LinearDodge = 'LinearDodge',
	LinearBurn = 'LinearBurn',
	LinearLight = 'LinearLight',
	VividLight = 'VividLight',
	PinLight = 'PinLight',
	HardMix = 'HardMix',
	Reflect = 'Reflect',
	Glow = 'Glow',
	Phoenix = 'Phoenix',
}
export enum SceneSnapshotStatus {
	Stopped = 'Stopped',
	Playing = 'Playing',
}
export enum SceneCurve {
	// Used both in snapshots and transitions
	Linear = 'Linear',
	QuadIn = 'QuadIn',
	QuadOut = 'QuadOut',
	QuadInOut = 'QuadInOut',
	QuadOutIn = 'QuadOutIn',
	CubicIn = 'CubicIn',
	CubicOut = 'CubicOut',
	CubicInOut = 'CubicInOut',
	CubicOutIn = 'CubicOutIn',
	QuartIn = 'QuartIn',
	QuartOut = 'QuartOut',
	QuartInOut = 'QuartInOut',
	QuartOutIn = 'QuartOutIn',
	QuintIn = 'QuintIn',
	QuintOut = 'QuintOut',
	QuintInOut = 'QuintInOut',
	QuintOutIn = 'QuintOutIn',
	SineIn = 'SineIn',
	SineOut = 'SineOut',
	SineInOut = 'SineInOut',
	SineOutIn = 'SineOutIn',
	ExpoIn = 'ExpoIn',
	ExpoOut = 'ExpoOut',
	ExpoInOut = 'ExpoInOut',
	ExpoOutIn = 'ExpoOutIn',
	CircularIn = 'CircularIn',
	CircularOut = 'CircularOut',
	CircularInOut = 'CircularInOut',
	CircularOutIn = 'CircularOutIn',
	ElasticIn = 'ElasticIn',
	ElasticOut = 'ElasticOut',
	ElasticInOut = 'ElasticInOut',
	ElasticOutIn = 'ElasticOutIn',
	BackIn = 'BackIn',
	BackOut = 'BackOut',
	BackInOut = 'BackInOut',
	BackOutIn = 'BackOutIn',
	BounceIn = 'BounceIn',
	BounceOut = 'BounceOut',
	BounceInOut = 'BounceInOut',
	BounceOutIn = 'BounceOutIn',
}
export enum SceneSnapshotPriorityRecall {
	Off = 'Off',
	Pre = 'Pre',
	Post = 'Post',
}
// ------------------------- types -----------------------------

// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateSceneObject = Omit<OmitReadonly<SceneObject>, 'nextTransition' | 'keyPreview'> & {
	// Also allow string as input, for convenience:
	nextTransition: (SceneObject['nextTransition'][0] | string)[]
	keyPreview: SceneObject['keyPreview'] | string
}

export type UpdateSceneLayerObject = Omit<
	OmitReadonly<SceneLayerObject>,
	'sourceA' | 'sourcePgm' | 'sourcePst' | 'sourceOptions'
> & {
	// Also allow string as input, for convenience:
	sourceA: SceneLayerObject['sourceA'] | string
	// sourceB is readonly
	sourcePgm: SceneLayerObject['sourcePgm'] | string
	sourcePst: SceneLayerObject['sourcePst'] | string
	sourceOptions: (SceneLayerObject['sourceOptions'][0] | string)[]
}
export type UpdateSceneTransitionObject = OmitReadonly<SceneTransitionObject>
export type UpdateSceneTransitionMixEffectObject = OmitReadonly<SceneTransitionMixEffectObject>
export type UpdateSceneSnapshotObject = OmitReadonly<SceneSnapshotObject>
