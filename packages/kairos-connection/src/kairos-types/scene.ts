import { OmitReadonly } from '../lib/omit-readonly.js'

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
	resolution: SceneResolution

	/** list[ObjectID] */
	nextTransition: string[]

	/** [ integer ,min: 0, max: 9999 ] */
	allDuration: number
	/** float  */
	allFader: number
	/** [ ObjectID ] */
	nextTransitionType: string
	faderReverse: boolean
	faderSync: boolean

	/**  */
	limitOffAction: SceneLimitOffAction
	/** [ integer, min: 0, max: 9999 ] */
	limitReturnTime: number
	/** ObjectID  */
	keyPreview: string
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
	 * [ ObjectID ]
	 */
	sourceA: string

	/**
	 * Source A/B source selection allows the User to select a source for the appropriate
	 * bus, regardless if the source is already part of “Source Options” in this Layer and/or
	 * Background or not. Next to the Source A/B source selection items, the actual
	 * selected source is displayed. Clicking on the symbol (Pen) right next to the setting,
	 * will open the according Input selection menu to select from all available listed
	 * external as well as internal sources.
	 * [ ObjectID, read_only ]
	 */
	readonly sourceB: string

	/** [ ObjectID ] */
	sourcePgm: string
	/**
	 * [ ObjectID ] */
	sourcePst: string
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
	sourceOptions: string[]

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
	dissolveMode: SceneLayerDissolveMode

	/**
	 * [ enum ]
	 */
	blendMode: SceneLayerBlendMode
}
export interface SceneLayerEffectCropObject {
	enabled: boolean

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated Crop
	 * value, the according slider, the numeric entry box or the arrow up/down icons can
	 * be used.
	 * [ float, min: 0, max: 1 ]
	 */
	top: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated Crop
	 * value, the according slider, the numeric entry box or the arrow up/down icons can
	 * be used.
	 * [ float, min: 0, max: 1 ]
	 */
	left: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated Crop
	 * value, the according slider, the numeric entry box or the arrow up/down icons can
	 * be used.
	 * [ float, min: 0, max: 1 ]
	 */
	right: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated Crop
	 * value, the according slider, the numeric entry box or the arrow up/down icons can
	 * be used.
	 * [ float, min: 0, max: 1 ]
	 */
	bottom: number

	/**
	 * Softness will be applied for all edges equally. The control range is from 0.00% to
	 * 100.00%. To adjust the "Softness" value, the according slider, the numeric entry box
	 * or the arrow up/down icons can be used.
	 * [ float, min: 0, max: 1 ]
	 */
	softness: number

	/**
	 * With the slider "Rounded corners" the radius on the Top-Left, Top-Right, Bottom-
	 * Left and Bottom-Right corner of a selected Layer source can be adjusted, once
	 * "Crop" for this Layer is enabled. The control range is from 0.00% to 100.00%,
	 * default = 0.00%.
	 * [ float, min: 0, max: 1 ]
	 */
	roundedCorners: number

	/**
	 * "Global Softness" is enabled by default. In this case the check box appears ticked.
	 * Apart from overall "Softness", all other Softness controls underneath are disabled.
	 */
	globalSoftness: boolean

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated
	 * Softness value, the according slider, the numeric entry box or the arrow up/down
	 * icons can be used.
	 * [ float, read_only, min: 0, max: 1 ]
	 */
	readonly softnessTop: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated
	 * Softness value, the according slider, the numeric entry box or the arrow up/down
	 * icons can be used.
	 * [ float, read_only, min: 0, max: 1 ]
	 */
	readonly softnessLeft: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated
	 * Softness value, the according slider, the numeric entry box or the arrow up/down
	 * icons can be used.
	 * [ float, read_only, min: 0, max: 1 ]
	 */
	readonly softnessRight: number

	/**
	 * The control range is from 0.00% to 100.00%. In order to adjust the designated
	 * Softness value, the according slider, the numeric entry box or the arrow up/down
	 * icons can be used.
	 * [ float, read_only, min: 0, max: 1 ]
	 */
	readonly softnessBottom: number
}
export interface SceneLayerEffectLuminanceKeyObject {
	enabled: boolean

	/**
	 * In order to adjust the level for Clip, the according slider, the numeric entry box or the
	 * arrow up/down icons can be used. The "Clip" control range is from 0.00% to
	 * 100.00%. Default is at 50.00%.
	 * Clip control acts like an attenuator or amplifier to the processed Key signal.
	 * [ float, min: 0, max: 1 ]
	 */
	clip: number

	/**
	 * In order to adjust the level for Clip, the according slider, the numeric entry box or the
	 * arrow up/down icons can be used. The "Clip" control range is from 1.00% to
	 * 1000.00%. Default is at 100.00%.
	 * Gain control acts like a Contrast or Focus control to the processed Key signal.
	 * [ float, min: 0.01, max: 10 ]
	 */
	gain: number

	/**
	 * In order to adjust the level for Cleanup, the according slider, the numeric entry box
	 * or the arrow up/down icons can be used. The "Clip" control range is from 0.00% to
	 * 100.00%. Default is at 0.00%.
	 * Cleanup control is affecting the processed Key signal on the dark areas, resulting in
	 * making the Black even more Black, avoiding unwanted shaddows for example.
	 * [ float, min: -2, max: 2 ]
	 */
	cleanup: number

	/**
	 * In order to adjust the level for Density, the according slider, the numeric entry box or
	 * the arrow up/down icons can be used. The "Clip" control range is from 0.00% to
	 * 100.00%. Default is at 0.00%.
	 * Density control is affecting the processed Key signal on the light areas, resulting in
	 * making the White even more White, avoiding unwanted transparency.
	 * [ float, min: -2, max: 2 ]
	 */
	density: number

	/**
	 * When inverting the Key signal regardless of mode "Selfkey" or "Splitkey", the entire
	 * Black and White values of the Key signal will be inverted in luminance. When Invert
	 * is enabled the check box appears ticked.
	 */
	invert: boolean

	/**
	 * When a "Luminance Key" operation is in progress the "Blend mode" drop down
	 * menu can be used to change from "Auto" mode direct into "Additive" or
	 * "Multiplicative" mode. Default mode is "Auto", in which the most common mode in
	 * respect to the actual selected Luminance Key source is used.
	 * In Additive mode the Key Signal is multiplied with the Background signal. The
	 * according Foreground Fill signal which mandatory has to be on a Black background,
	 * will be added on top, which means all Luminance and Chrominance levels higher
	 * than 0% Black. "Multiplicative" mode instead is multiplying the Foreground Fill
	 * signal.
	 */
	blendMode: SceneLayerEffectLuminanceKeyBlendMode

	/**
	 * Enabling a "Source Key" apart from Default=none, will change the so called
	 * "Selfkey" mode into a "Split Key" mode.
	 * "Source Key" source selection allows the User to select a different source to be
	 * used as Key signal than the Layer source. Next to the Source Key source selection
	 * items, the actual selected source (Default=None)is displayed. Clicking on the
	 * symbol (Pen) right next to the setting, will open the according Source selection
	 * menu to select from all available listed external as well as internal sources.
	 * [ ObjectID ]
	 */
	sourceKey: string
}
export interface SceneLayerEffectTransform2DObject {
	enabled: boolean

	/**
	 * Transform type selection
	 * 0 = 2D, 1 = 2.5D
	 */
	type: SceneLayerEffectTransform2DType

	/**
	 * Default for "Scale" is 100.00% which is fullscreen size for selected Layer or
	 * Background Layer. So a "Scale" of e.g. 50.00% will result in a quarter sized Layer.
	 * The control range for "Scale" is from 0,00% to 1000,00% and adjustments can be
	 * done using the according slider, the numeric entry box or the arrow up/down icons.
	 * [ float, min: 0, max: 10 ]
	 */
	scale: number

	/**
	 * ( can only be set if type=2.5D )
	 * [ float, min: -3.6, max: 3.6 ]
	 */
	rotationX: number

	/**
	 * ( can only be set if type=2.5D )
	 * [ float, min: -3.6, max: 3.6 ]
	 */
	rotationY: number

	/**
	 * The "Rotation" control range is from 0,00% to 999900,00% whereby a value of
	 * 25,00% and it's multiples is equivelant to angles of 90 degrees (and their multiples).
	 * Rotation adjustments can be applied using the according slider, the numeric entry
	 * box or the arrow up/down icons.
	 * [ float, min: -3.6, max: 3.6 ]
	 */
	rotationZ: number

	/**
	 * The control range for "Rotation origin" is +/- 5.0000 in X/Y position and can be
	 * modified using the numeric entry box, the arrow up/down icons or the "drag-pad"
	 * located to the far right side at the "Rotation origin" item.
	 */
	rotationOrigin: Pos3Df

	/**
	 * Default Layer "Position" is at X=0.0000/Y=0.0000 which is at center position. The
	 * "Position" control range in respect to the picture dimension is +/- 5.0000 in X/Y
	 * position and can be modified using the numeric entry box, the arrow up/down icons
	 * or the "drag-pad" located to the far right side at the "Position" item.
	 */
	position: Pos3Df

	/**
	 * While the "Cubic interpolition" mode is disabled, the check box appears unticked
	 * and the linear interpolation method is used.
	 * The "Linear interpolation" is using a smaller amount of pixels in the
	 * Scaling/Positioning process and is mainly used when the target size of the image is
	 * smaller than the original image size. The "Cubic interpolation" mode is
	 * recommended when the target image size is enlarged compared to the original
	 * image size.
	 */
	cubicInterpolation: boolean

	hideBackside: boolean

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	stretchH: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	stretchV: number
}
export interface SceneLayerEffectChromaKeyObject {
	enabled: boolean

	/**
	 * In order to adjust the level for Clip, the according slider, the numeric entry box or the
	 * arrow up/down icons can be used. The "Clip" control range is from 0.00% to
	 * 100.00%. Default is at 50.00%.
	 * Clip control acts like an attenuator or amplifier to the processed Key signal.
	 * [ float, min: 0, max: 1 ]
	 */
	clip: number

	/**
	 * In order to adjust the level for Clip, the according slider, the numeric entry box or the
	 * arrow up/down icons can be used. The "Gain" control range is from 0.00% to
	 * 100.00%. Default is at 50.00%.
	 * Gain control acts like a Contrast or Focus control to the processed Key signal.
	 * [ float, min: 0.01, max: 10 ]
	 */
	gain: number

	/**
	 * In order to adjust the level for Cleanup, the according slider, the numeric entry box
	 * or the arrow up/down icons can be used. The "Cleanup" control range is from 0.00%
	 * to 100.00%. Default is at 0.00%.
	 * Cleanup control is affecting the processed Key signal on the dark areas, resulting in
	 * making the Black even more Black, avoiding unwanted shaddows for example.
	 * [ float, min: -2, max: 2 ]
	 */
	cleanup: number

	/**
	 * In order to adjust the level for Density, the according slider, the numeric entry box or
	 * the arrow up/down icons can be used. The "Density" control range is from 0.00% to
	 * 100.00%. Default is at 0.00%.
	 * Density control is affecting the processed Key signal on the light areas, resulting in
	 * making the White even more White, avoiding unwanted transparency.
	 * [ float, min: -2, max: 2 ]
	 */
	density: number

	/**
	 * In order to adjust the level for Hue, the according slider, the numeric entry box or
	 * the arrow up/down icons can be used. The "Hue" control range is from 0.00 degree
	 * to 36000.00 degree. Default is at 22500.00 degree.
	 * Hue control is defining the Chroma angle inside a 360 degree color circle. Refering
	 * to a test pattern called "Hue" or also known as "Color Circle".
	 * [ float, min: 0, max: 3.60 ]
	 */
	hue: number

	/**
	 * In order to adjust the level for Selectivity Left, the according slider, the numeric entry
	 * box or the arrow up/down icons can be used. The "Selectivity Left" control range is
	 * from 0.00 degree to 90.00 degree. Default is at 30.00 degree.
	 * When chroma key source is using a so called "Hue" test pattern, also known as
	 * "Color Circle", the Selectivity Left control is opening or closing the left shoulder of
	 * the used chroma key color. Maximum open is at 90.00 degree. In total Selectivity
	 * Left and Selectivity Right is 180.00 degree.
	 * [ float, min: 0, max: 0.9 ]
	 */
	selectivityLeft: number

	/**
	 * In order to adjust the level for Selectivity Right, the according slider, the numeric
	 * entry box or the arrow up/down icons can be used. The "Selectivity Right" control
	 * range is from 0.00 degree to 90.00 degree. Default is at 30.00 degree.
	 * When chroma key source is using a so called "Hue" test pattern, also known as
	 * "Color Circle", the Selectivity Right control is opening or closing the right shoulder of
	 * the used chroma key color. Maximum open is at 90.00 degree. In total Selectivity
	 * Left and Selectivity Right is 180.00 degree.
	 * [ float, min: 0, max: 0.9 ]
	 */
	selectivityRight: number

	/**
	 * In order to adjust the level for Luminance, the according slider, the numeric entry
	 * box or the arrow up/down icons can be used. The "Luminance" control range is from
	 * 0.00% to 100.00%. Default is at 50.00%.
	 * Luminance control is used to setup the level of luminance for the selected color and
	 * adjusted saturation.
	 * [ float, min: 0, max: 1 ]
	 */
	luminance: number

	/**
	 * In order to adjust the level for Chroma, the according slider, the numeric entry box
	 * or the arrow up/down icons can be used. The "Chroma" control range is from 0.00%
	 * to 100.00%. Default is at 20.00%.
	 * Chroma control is used to setup the level of saturation for the selected color angle.
	 * [ float, min: 0, max: 1 ]
	 */
	chroma: number

	/**
	 * In order to adjust the level for Achroma, the according slider, the numeric entry box
	 * or the arrow up/down icons can be used. The "Achroma" control range is from
	 * 0.00% to 100.00%. Default is at 0.00%.
	 * Achroma control can be used to limit the level of saturation formerly defined in
	 * "Chroma" control.
	 * [ float, min: 0, max: 1 ]
	 */
	aChroma: number

	/**
	 * In order to adjust the level for Spill Supression, the according slider, the numeric
	 * entry box or the arrow up/down icons can be used. The "Spill Supression" control
	 * range is from 0.00% to 100.00%. Default is at 0.00%.
	 * Spill Supression is using the defined Chroma Key color area and opens the
	 * processed key whole in concentric direction and added to the main Key signal.
	 * [ float, min: 0, max: 1 ]
	 */
	spillSupression: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	spillSupressionLeft: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	spillSupressionRight: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	noiseRemoval: number

	/**
	 * When inverting the Key signal regardless of mode "Selfkey" or "Splitkey", the entire
	 * Black and White values of the Key signal will be inverted such as the White areas
	 * will become transparent and the Black areas will becomes Opac. When Invert is
	 * enabled the check box appears ticked.
	 */
	invert: boolean

	/**
	 * When FGD-Fade is enabled the key result is forced to be represented in "Additive
	 * Key" mode. Disabling FGD-Fade will cause that "Multiplicative Key" mode is
	 * enforced.
	 */
	fgdFade: boolean

	/**
	 * Starting the Auto adjust task/procedure will ensure that all Chroma Key settings
	 * based on the most represented single color in the selected source will be optimized
	 * while running the auto setup procedure.
	 * [ int ]
	 */
	autoState: number

	edgeSmoothingSize: SceneLayerEffectChromaKeyEdgeSmoothingSize
}
export interface SceneLayerEffectYUVCorrectionObject {
	enabled: boolean

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	pedestal: number

	/**
	 * Increasing or decreasing the Luminance Lift value in "YUV Correction Settings" is
	 * adding/subtracting luminance from selected source. The "Luminance Lift" control
	 * range is +/-100.00%. Default is at 0.00%. Adjustments can be applied using the
	 * according slider, the numeric entry box or the arrow up/down icons.
	 * [ float, min: -1, max: 1 ]
	 */
	luminanceLift: number

	/**
	 * Increasing or decreasing the Luminance Gain value in "YUV Correction Settings" is
	 * multiplying luminance into selected source. Pure "Black" remains unaffected. The
	 * "Luminance gain" control range is from 0.00% to 600.00%. Default is at 100.00%.
	 * Adjustments can be applied using the according slider, the numeric entry box or the
	 * arrow up/down icons.
	 * [ float, min: 0.1, max: 10 ]
	 */
	luminanceGain: number

	/**
	 * Increasing or decreasing the Luminance Gamma value in "YUV Correction Settings"
	 * is multiplying luminance only into the midtones on selected source. Pure "Black"
	 * and 100% "White" remains unaffected. The "Luminance gamma" control range is
	 * from 0.00% to 800.00%. Default is at 100.00%. Adjustments can be applied using
	 * the according slider, the numeric entry box or the arrow up/down icons.
	 * [ float, min: 0.1, max: 10 ]
	 */
	luminanceGamma: number

	/**
	 * Increasing or decreasing the Contrast value in "YUV Correction Settings" is
	 * affecting the separation(positive range) or the morphing (negative range) of
	 * luminance values over the selected source. Pure "Black" and 100% "White" remains
	 * unaffected. The "Contrast" control range is +/-100.00%. Default is at 0.00%.
	 * Adjustments can be applied using the according slider, the numeric entry box or the
	 * arrow up/down icons.
	 * [ float, min: -1, max: 1 ]
	 */
	contrast: number

	/**
	 * Increasing or decreasing the Saturation value in "YUV Correction Settings" is
	 * adding (positive range) or subtracting (negative range) Saturation into/from the
	 * selected source. Bringing the Saturation value down to "0"% will cause a true
	 * "Black/White" image as a result. The "Saturation" control range is from 0.00% to
	 * 500.00%. Default is at 100.00%. Adjustments can be applied using the according
	 * slider, the numeric entry box or the arrow up/down icons.
	 * [ float, min: 0, max: 2 ]
	 */
	saturation: number

	/**
	 * Changing the UV-Rotation value in "YUV Correction Settings" is rotating/shifting the
	 * Color space on the selected source.The "Saturation" control range is +/-36000.00
	 * degree. Default is at 0.00%. Adjustments can be applied using the according slider,
	 * the numeric entry box or the arrow up/down icons.
	 * [ float, min: -3.6, max: 3.6 ]
	 */
	uvRotation: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	cyanRed: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	magentaGreen: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	yellowBlue: number
}
export interface SceneLayerEffectRGBCorrectionObject {
	enabled: boolean

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	pedestalRed: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	pedestalGreen: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	pedestalBlue: number

	/**
	 * Increasing or decreasing the Lift Red value in "RGB Correction Settings" is
	 * adding/subtracting Red into/from selected source. The "Lift Red" control range is +/-
	 * 100.00%. Default is at 0.00%. Adjustments can be applied using the according
	 * slider, the numeric entry box or the arrow up/down icons.
	 * [ float, min: -1, max: 1 ]
	 */
	liftRed: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	liftGreen: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	liftBlue: number

	/**
	 * Increasing or decreasing the Gain Red value in "RGB Correction Settings" is
	 * multiplying Red into selected source. Pure "Black" and 100% "White" remains
	 * unaffected. The "Gain Red" control range is from 0.00% to 600.00%. Default is at
	 * 100.00%. Adjustments can be applied using the according slider, the numeric entry
	 * box or the arrow up/down icons.
	 * [ float, min: 0.1, max: 10 ]
	 */
	gainRed: number

	/**
	 * [ float, min: 0.1, max: 10 ]
	 */
	gainGreen: number

	/**
	 * [ float, min: 0.1, max: 10 ]
	 */
	gainBlue: number

	/**
	 * Increasing or decreasing the Gamma Red value in "RGB Correction Settings" is
	 * multiplying Red only into the midtones on selected source. Pure "Black" and 100%
	 * "White" remains unaffected when the default value gets increased. The "Gamma
	 * Red" control range is from 0.00% to 800.00%. Default is at 100.00%. Adjustments
	 * can be applied using the according slider, the numeric entry box or the arrow
	 * up/down icons.
	 * [ float, min: 0.1, max: 10 ]
	 */
	gammaRed: number

	/**
	 * [ float, min: 0.1, max: 10 ]
	 */
	gammaGreen: number

	/**
	 * [ float, min: 0.1, max: 10 ]
	 */
	gammaBlue: number
}
export interface SceneLayerEffectLUTCorrectionObject {
	enabled: boolean

	/**
	 * The "Index" drop down menu contains 16 presets to choose from, such as
	 * "Cinema", "Cinema (Bright)", "Cinema (Cold)", "Cinema (Warm)", "Cinema (Drama)",
	 * "Artistic 1", "Artistic 2", "Artistic 3", "Artistic 4", "Artistic 5", "Artistic 6", "Artistic 7",
	 * "Artistic 8", "Artistic 9", "B and W 1" and "B and W 2".
	 * [ enum, min: 0, max: 15 ]
	 */
	index: SceneLayerEffectLUTCorrectionIndex

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	inputColorspace: SceneLayerEffectLUTCorrectionColorspace

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	outputColorspace: SceneLayerEffectLUTCorrectionColorspace

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	inputRange: SceneLayerEffectLUTCorrectionRange

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	outputRange: SceneLayerEffectLUTCorrectionRange

	colorSpaceConversion: boolean
}
export interface SceneLayerEffectVirtualPTZObject {
	enabled: boolean

	/**
	 * The "Position" control range in respect to the picture dimension is +/- 5.0000 in X/Y
	 * position and can be modified using the numeric entry box, the arrow up/down icons
	 * or the "drag-pad" located to the far right side at the "Position" item. Default Layer
	 * "Position" is at X=0.0000/Y=0.0000
	 */
	position: Pos2Df

	/**
	 * The control range for "Zoom" is from 100,00% to 500,00% and adjustments can be
	 * done using the according slider, the numeric entry box or the arrow up/down icons.
	 * Default for "Zoom" is 100.00%.
	 * [ float, min: 1, max: 15 ]
	 */
	zoom: number
}
export interface SceneLayerEffectToneCurveCorrectionObject {
	enabled: boolean

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	blackRed: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	blackGreen: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	blackBlue: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayLowRed: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayLowGreen: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayLowBlue: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayHighRed: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayHighGreen: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	grayHighBlue: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	whiteRed: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	whiteGreen: number

	/**
	 * [ float, min: -0.1, max: 1.08 ]
	 */
	whiteBlue: number
}
export interface SceneLayerEffectMatrixCorrectionObject {
	enabled: boolean

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	rgN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	rgP: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	rbN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	rbP: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	grN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	grP: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	gbN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	gbP: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	brN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	brP: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	bgN: number

	/**
	 * [ float, min: -0.6, max: 0.6 ]
	 */
	bgP: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	redPhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	redLevel: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	yellowPhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	yellowLevel: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	greenPhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	greenLevel: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	cyanPhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	cyanLevel: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	bluePhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	blueLevel: number

	/**
	 * [ float, min: -0.3, max: 0.3 ]
	 */
	magentaPhase: number

	/**
	 * [ float, min: 0.0, max: 2.0 ]
	 */
	magentaLevel: number
}
export interface SceneLayerEffectTemperatureCorrectionObject {
	enabled: boolean

	/**
	 * [ int, min: 1000, max: 40000 ]
	 */
	temperature: number

	/**
	 * [ float, min: -0.5, max: 0.5 ]
	 */
	tint: number

	keepLuminance: boolean
}
export interface SceneLayerEffectLinearKeyObject {
	enabled: boolean
	invert: boolean

	/**
	 * [ ObjectID ]
	 */
	keySource: string

	blendMode: SceneLayerEffectLinearKeyBlendMode
}
export interface SceneLayerEffectPositionObject {
	enabled: boolean
	position: Pos2D

	/**
	 * [ int, min: 1, max: 4096 ]
	 */
	width: number // assuming there is a typo in the docs (it's called "size" there)

	// size: number // wierd, we get an Error if we query for the size

	/**
	 * [ int, min: 1, max: 4096 ]
	 */
	height: number

	/**
	 * [ enum, min: 0, max: 3 ]
	 */
	rotate: SceneLayerEffectPositionRotate
}
export interface SceneLayerEffectPCropObject {
	enabled: boolean

	/**
	 * [ int, min: 0, max: 1024 ]
	 */
	left: number

	/**
	 * [ int, min: 0, max: 1024 ]
	 */
	right: number

	/**
	 * [ int, min: 0, max: 1024 ]
	 */
	top: number

	/**
	 * [ int, min: 0, max: 1024 ]
	 */
	bottom: number
}
export interface SceneLayerEffectFilmLookObject {
	// enabled: boolean // hmm, there is no enabled defined in the protocol

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	crack: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	spots: number

	/**
	 * [ float, min: -1, max: 1 ]
	 */
	grain: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	shake: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	shadow: number

	colorMode: SceneLayerEffectFilmLookColorMode

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	colorStrength: number
}
export interface SceneLayerEffectGlowEffectObject {
	// enabled: boolean  // hmm, there is no enabled defined in the protocol

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	clip: number

	/**
	 * [ float, min: 0.01, max: 10 ]
	 */
	gain: number

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	softness: number

	glowColor: ColorRGB
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
	curve: SceneSnapshotCurve

	/**
	 * [enum, min: 0, max: 2 ]
	 */
	priorityRecall: SceneSnapshotPriorityRecall
}

// ------------------------- enums -----------------------------
export enum SceneResolution {
	Resolution1280x720 = '1280x720',
	Resolution1920x1080 = '1920x1080',
	Resolution3840x2160 = '3840x2160',
}
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
export enum SceneLayerDissolveMode {
	Normal = 'Normal',
	Reverse = 'Reverse',
	Cross = 'Cross',
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
export enum SceneLayerEffectLuminanceKeyBlendMode {
	Auto = 'Auto',
	Additive = 'Additive',
	Multiplicative = 'Multiplicative',
}
export enum SceneLayerEffectTransform2DType {
	TwoD = '2D',
	TwoPointFiveD = '2.5D',
}
export enum SceneLayerEffectChromaKeyEdgeSmoothingSize {
	Off = 'Off',
	Small = 'Small',
}
export enum SceneLayerEffectLUTCorrectionIndex {
	Cinema = 'Cinema',
	CinemaBright = 'Cinema (Bright)',
	CinemaCold = 'Cinema (Cold)',
	CinemaWarm = 'Cinema (Warm)',
	CinemaDrama = 'Cinema (Drama)',
	Artistic1 = 'Artistic 1',
	Artistic2 = 'Artistic 2',
	Artistic3 = 'Artistic 3',
	Artistic4 = 'Artistic 4',
	Artistic5 = 'Artistic 5',
	BWOne = 'B&W 1',
	BWTwo = 'B&W 2',
	User1 = 'User 1',
	User2 = 'User 2',
	User3 = 'User 3',
	User4 = 'User 4',
}
export enum SceneLayerEffectLUTCorrectionColorspace {
	BT709 = 'BT709',
	BT2020BT2100 = 'BT2020-BT2100',
}
export enum SceneLayerEffectLUTCorrectionRange {
	Normal = 'Normal',
	Full = 'Full',
}
export enum SceneLayerEffectLinearKeyBlendMode {
	Auto = 'Auto',
	Additive = 'Additive',
	Multiplicative = 'Multiplicative',
}
export enum SceneLayerEffectPositionRotate {
	Rotate0 = '0°',
	Rotate90 = '90°',
	Rotate180 = '180°',
	Rotate270 = '270°',
}
export enum SceneLayerEffectFilmLookColorMode {
	NotChanged = 'Not changed',
	Monocrome = 'Monocrome',
	Sepia = 'Sepia',
	Film = 'Film',
}
export enum SceneSnapshotStatus {
	Stopped = 'Stopped',
	Playing = 'Playing',
}
export enum SceneSnapshotCurve {
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
export interface Pos3Df {
	x: number
	y: number
	z: number
}

export interface Pos2Df {
	x: number
	y: number
}

export interface Pos2D {
	x: number
	y: number
}

export type ColorRGB = {
	red: number
	green: number
	blue: number
}

// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateSceneObject = OmitReadonly<SceneObject>
export type UpdateSceneLayerObject = OmitReadonly<SceneLayerObject>
export type UpdateSceneLayerEffectCropObject = OmitReadonly<SceneLayerEffectCropObject>
export type UpdateSceneLayerEffectLuminanceKeyObject = OmitReadonly<SceneLayerEffectLuminanceKeyObject>
export type UpdateSceneLayerEffectTransform2DObject = OmitReadonly<SceneLayerEffectTransform2DObject>
export type UpdateSceneLayerEffectChromaKeyObject = OmitReadonly<SceneLayerEffectChromaKeyObject>
export type UpdateSceneLayerEffectYUVCorrectionObject = OmitReadonly<SceneLayerEffectYUVCorrectionObject>
export type UpdateSceneLayerEffectRGBCorrectionObject = OmitReadonly<SceneLayerEffectRGBCorrectionObject>
export type UpdateSceneLayerEffectLUTCorrectionObject = OmitReadonly<SceneLayerEffectLUTCorrectionObject>
export type UpdateSceneLayerEffectVirtualPTZObject = OmitReadonly<SceneLayerEffectVirtualPTZObject>
export type UpdateSceneLayerEffectToneCurveCorrectionObject = OmitReadonly<SceneLayerEffectToneCurveCorrectionObject>
export type UpdateSceneLayerEffectMatrixCorrectionObject = OmitReadonly<SceneLayerEffectMatrixCorrectionObject>
export type UpdateSceneLayerEffectTemperatureCorrectionObject =
	OmitReadonly<SceneLayerEffectTemperatureCorrectionObject>
export type UpdateSceneLayerEffectLinearKeyObject = OmitReadonly<SceneLayerEffectLinearKeyObject>
export type UpdateSceneLayerEffectPositionObject = OmitReadonly<SceneLayerEffectPositionObject>
export type UpdateSceneLayerEffectPCropObject = OmitReadonly<SceneLayerEffectPCropObject>
export type UpdateSceneLayerEffectFilmLookObject = OmitReadonly<SceneLayerEffectFilmLookObject>
export type UpdateSceneLayerEffectGlowEffectObject = OmitReadonly<SceneLayerEffectGlowEffectObject>
export type UpdateSceneSnapshotObject = OmitReadonly<SceneSnapshotObject>
