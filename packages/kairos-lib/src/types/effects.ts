import type { OmitReadonly } from '../lib/omit-readonly.js'
import type { SourceRef } from '../lib/reference.js'
import type { ColorRGB, Pos2D, Pos2Df, Pos3Df } from './lib-types.js'

export interface EffectCropObject {
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
export interface EffectLuminanceKeyObject {
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
	blendMode: EffectLuminanceKeyBlendMode

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
	sourceKey: SourceRef | null
}
export interface EffectTransform2DObject {
	enabled: boolean

	/**
	 * Transform type selection
	 * 0 = 2D, 1 = 2.5D
	 */
	type: EffectTransform2DType

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
export interface EffectChromaKeyObject {
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

	edgeSmoothingSize: EffectChromaKeyEdgeSmoothingSize
}
export interface EffectYUVCorrectionObject {
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
export interface EffectRGBCorrectionObject {
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
export interface EffectLUTCorrectionObject {
	enabled: boolean

	/**
	 * The "Index" drop down menu contains 16 presets to choose from, such as
	 * "Cinema", "Cinema (Bright)", "Cinema (Cold)", "Cinema (Warm)", "Cinema (Drama)",
	 * "Artistic 1", "Artistic 2", "Artistic 3", "Artistic 4", "Artistic 5", "Artistic 6", "Artistic 7",
	 * "Artistic 8", "Artistic 9", "B and W 1" and "B and W 2".
	 * [ enum, min: 0, max: 15 ]
	 */
	index: EffectLUTCorrectionIndex

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	inputColorspace: EffectLUTCorrectionColorspace

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	outputColorspace: EffectLUTCorrectionColorspace

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	inputRange: EffectLUTCorrectionRange

	/**
	 * [ enum, min: 0, max: 1 ]
	 */
	outputRange: EffectLUTCorrectionRange

	colorSpaceConversion: boolean
}
export interface EffectVirtualPTZObject {
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
export interface EffectToneCurveCorrectionObject {
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
export interface EffectMatrixCorrectionObject {
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
export interface EffectTemperatureCorrectionObject {
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
export interface EffectLinearKeyObject {
	enabled: boolean
	invert: boolean

	/**
	 * [ ObjectID ]
	 */
	keySource: SourceRef | null // null means <undefined>

	blendMode: EffectLinearKeyBlendMode
}
export interface EffectPositionObject {
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
	rotate: EffectPositionRotate
}
export interface EffectPCropObject {
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
export interface EffectFilmLookObject {
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

	colorMode: EffectFilmLookColorMode

	/**
	 * [ float, min: 0, max: 1 ]
	 */
	colorStrength: number
}
export interface EffectGlowEffectObject {
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

// ------------------------- enums -----------------------------

export enum EffectLuminanceKeyBlendMode {
	Auto = 'Auto',
	Additive = 'Additive',
	Multiplicative = 'Multiplicative',
}
export enum EffectTransform2DType {
	TwoD = '2D',
	TwoPointFiveD = '2.5D',
}
export enum EffectChromaKeyEdgeSmoothingSize {
	Off = 'Off',
	Small = 'Small',
}
export enum EffectLUTCorrectionIndex {
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
export enum EffectLUTCorrectionColorspace {
	BT709 = 'BT709',
	BT2020BT2100 = 'BT2020-BT2100',
}
export enum EffectLUTCorrectionRange {
	Normal = 'Normal',
	Full = 'Full',
}
export enum EffectLinearKeyBlendMode {
	Auto = 'Auto',
	Additive = 'Additive',
	Multiplicative = 'Multiplicative',
}
export enum EffectPositionRotate {
	Rotate0 = '0°',
	Rotate90 = '90°',
	Rotate180 = '180°',
	Rotate270 = '270°',
}
export enum EffectFilmLookColorMode {
	NotChanged = 'Not changed',
	Monocrome = 'Monocrome',
	Sepia = 'Sepia',
	Film = 'Film',
}

// ------------------------- Update* types, used in update* methods --------------------------

export type UpdateEffectCropObject = OmitReadonly<EffectCropObject>
export type UpdateEffectLuminanceKeyObject = OmitReadonly<EffectLuminanceKeyObject> & {
	sourceKey: SourceRef // Cannot be null in updates
}
export type UpdateEffectTransform2DObject = OmitReadonly<EffectTransform2DObject>
export type UpdateEffectChromaKeyObject = OmitReadonly<EffectChromaKeyObject>
export type UpdateEffectYUVCorrectionObject = OmitReadonly<EffectYUVCorrectionObject>
export type UpdateEffectRGBCorrectionObject = OmitReadonly<EffectRGBCorrectionObject>
export type UpdateEffectLUTCorrectionObject = OmitReadonly<EffectLUTCorrectionObject>
export type UpdateEffectVirtualPTZObject = OmitReadonly<EffectVirtualPTZObject>
export type UpdateEffectToneCurveCorrectionObject = OmitReadonly<EffectToneCurveCorrectionObject>
export type UpdateEffectMatrixCorrectionObject = OmitReadonly<EffectMatrixCorrectionObject>
export type UpdateEffectTemperatureCorrectionObject = OmitReadonly<EffectTemperatureCorrectionObject>
export type UpdateEffectLinearKeyObject = OmitReadonly<EffectLinearKeyObject> & {
	keySource: SourceRef // Cannot be null in updates
}
export type UpdateEffectPositionObject = OmitReadonly<EffectPositionObject>
export type UpdateEffectPCropObject = OmitReadonly<EffectPCropObject>
export type UpdateEffectFilmLookObject = OmitReadonly<EffectFilmLookObject>
export type UpdateEffectGlowEffectObject = OmitReadonly<EffectGlowEffectObject>
