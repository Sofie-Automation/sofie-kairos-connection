import type { ObjectEncodingDefinition } from './types.js'
import {
	LabelPosition,
	MultiViewInputObject,
	MultiViewObject,
	MultiViewPipObject,
	Rotate,
	ShowTallyBorder,
} from 'kairos-lib'
import {
	parseAnySourceRef,
	parseBoolean,
	parseColorRGB,
	parseEnum,
	parseInteger,
	parsePos2Df,
} from '../lib/data-parsers.js'

export const MultiViewObjectEncodingDefinition: ObjectEncodingDefinition<MultiViewObject> = {
	available: { protocolName: 'available', parser: parseBoolean },
	background: { protocolName: 'background', parser: parseColorRGB },
	textScale: { protocolName: 'text_scale', parser: parseFloat },
	showTallyBorder: {
		protocolName: 'show_tally_border',
		parser: (value) => parseEnum<ShowTallyBorder>(value, ShowTallyBorder),
	},
	tallyBorderWidth: { protocolName: 'tally_border_width', parser: parseFloat },
	// requestOnDemand: { protocolName: 'request_on_demand', parser: parseBoolean },
}
export const MultiViewPipObjectEncodingDefinition: ObjectEncodingDefinition<MultiViewPipObject> = {
	position: { protocolName: 'position', parser: parsePos2Df },
	size: { protocolName: 'size', parser: parseFloat },
	rotate: { protocolName: 'rotate', parser: (value) => parseEnum<Rotate>(value, Rotate) },
	labelPosition: { protocolName: 'label_position', parser: (value) => parseEnum<LabelPosition>(value, LabelPosition) },
	textColor: { protocolName: 'text_color', parser: parseColorRGB },
	backgroundColor: { protocolName: 'background_color', parser: parseColorRGB },
	backgroundOpacity: { protocolName: 'background_opacity', parser: parseFloat },
}

export const MultiViewInputObjectEncodingDefinition: ObjectEncodingDefinition<MultiViewInputObject> = {
	source: { protocolName: 'source', parser: parseAnySourceRef },
	tallyRoot: { protocolName: 'tally_root', parser: parseInteger },
	requestOnDemand: { protocolName: 'request_on_demand', parser: parseBoolean },
}
