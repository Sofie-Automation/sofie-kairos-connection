export interface MediaObject {
	name: string
	/** int */
	status: number
	/** float */
	loadProgress: number
}

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
	 * int: [ min: 16 | max: 3840 ]
	 */
	readonly resolutionX: number

	/**
	 * When enabling the “Advanced resolution control” after unfolding the “Advanced”
	 * controls and tick the check box, the X - and Y-Resolution sliders allow to determine
	 * the individual resolution per Scene. This setting is independent from the selected
	 * sources within the Scene -internal sources as well as external sources, and from
	 * the designated outputs. In order to adjust the individual X/Y settings, the according
	 * slider, the numeric entry box or the arrow up/down icons can be used.
	 * int: [ min: 10 | max: 2160 ]
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
	 * [integer]
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
	color: string

	/**
	 * The drop down menu next to “Resolution” allows to determine the designated
	 * Scene-Resolution. The selectable defaults are “1280x720p”, “1920x1080p” and
	 * “3840x2160”. */
	resolution: SceneResolution

	/** list[ObjectID] */
	nextTransition: string[]

	/** int: [ min: 0 | max: 9999 ] */
	allDuration: number
	/** float  */
	allFader: number
	/** ObjectID */
	nextTransitionType: string
	faderReverse: boolean
	faderSync: boolean

	/**  */
	limitOffAction: SceneLimitOffAction
	/** int: [ min: 0 | max: 9999 ] */
	limitReturnTime: number
	/** ObjectID  */
	keyPreview: string
}
export type UpdateSceneObject = OmitReadonly<SceneObject>
export enum SceneLimitOffAction {
	None = 0,
	ToBegin = 1,
	ToEnd = 2,
}
export enum SceneResolution {
	Resolution1280x720 = 0,
	Resolution1920x1080 = 1,
	Resolution3840x2160 = 2,
}

export interface ClipPlayerObject {
	colorOverwrite: boolean
	/**
	 * RGB color value
	 * @example rgb(255,0,0)
	 */
	color: string
	timecode: string
	remainingTime: string
	/** int */
	position: number
	repeat: boolean
	tms: ClipPlayerTMS

	/** ObjectID */
	clip: string

	/** int */
	readonly tally: number

	autoplay: boolean
}
export type UpdateClipPlayerObject = OmitReadonly<ClipPlayerObject>

export enum ClipPlayerTMS {
	Pause = 0,
	Reverse = 1,
	Rewind = 2,
	Play = 3,
	LoopPlay = 4,
	FastForward = 5,
	Stop = 6,
	Begin = 7,
	End = 8,
}

/** Copied from https://github.com/piotrwitek/utility-types/blob/2ae7412a9edf12f34fedbf594facf43cf04f7e32/src/mapped-types.ts#L112 */

/**
 * MutableKeys
 * @desc Get union type of keys that are mutable in object type `T`
 * Credit: Matt McCutchen
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 * @example
 *   type Props = { readonly foo: string; bar: number };
 *
 *   // Expect: "bar"
 *   type Keys = MutableKeys<Props>;
 */
type MutableKeys<T extends object> = {
	[P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

export type OmitReadonly<T extends object> = Pick<T, MutableKeys<T>>
