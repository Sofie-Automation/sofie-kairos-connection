import type { ObjectEncodingDefinition } from './types.js'
import { SceneSnapshotObject, SceneSnapshotStatus, SceneCurve, SceneSnapshotPriorityRecall } from 'kairos-lib'
import { parseEnum, parseInteger, parseBoolean, parseColorRGB } from '../lib/data-parsers.js'

export const SceneSnapshotObjectEncodingDefinition: ObjectEncodingDefinition<SceneSnapshotObject> = {
	status: {
		protocolName: 'status',
		parser: (value) => parseEnum<SceneSnapshotStatus>(value, SceneSnapshotStatus),
	},
	color: { protocolName: 'color', parser: parseColorRGB },
	dissolveTime: { protocolName: 'dissolve_time', parser: parseInteger },
	enableCurve: { protocolName: 'enable_curve', parser: parseBoolean },
	curve: {
		protocolName: 'curve',
		parser: (value) => parseEnum<SceneCurve>(value, SceneCurve),
	},
	priorityRecall: {
		protocolName: 'priority_recall',
		parser: (value) => parseEnum<SceneSnapshotPriorityRecall>(value, SceneSnapshotPriorityRecall),
	},
}
