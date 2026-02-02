import type { ObjectEncodingDefinition } from './types.js'
import { SystemInfoObject, SystemSettingsObject } from 'kairos-lib'
import { parseBoolean, parseString } from '../lib/data-parsers.js'

export const SystemInfoObjectEncodingDefinition: ObjectEncodingDefinition<SystemInfoObject> = {
	releaseVersion: { protocolName: 'release_version', parser: parseString },
	systemId: { protocolName: 'system_id', parser: parseString },
	var1: { protocolName: 'var1', parser: parseString },
	var2: { protocolName: 'var2', parser: parseString },
	var3: { protocolName: 'var3', parser: parseString },
	var4: { protocolName: 'var4', parser: parseString },
	var5: { protocolName: 'var5', parser: parseString },
	var6: { protocolName: 'var6', parser: parseString },
	var7: { protocolName: 'var7', parser: parseString },
	var8: { protocolName: 'var8', parser: parseString },
	smartRoutingEnabled: { protocolName: 'smart_routing_enabled', parser: parseBoolean },
}
export const SystemSettingsObjectEncodingDefinition: ObjectEncodingDefinition<SystemSettingsObject> = {
	rawPanelEnable: { protocolName: 'raw_panel_enable', parser: parseBoolean },
	rawPanelStatus: { protocolName: 'raw_panel_status', parser: parseString },
	rawPanel1: { protocolName: 'raw_panel_1', parser: parseString },
	rawPanel2: { protocolName: 'raw_panel_2', parser: parseString },
	rawPanel3: { protocolName: 'raw_panel_3', parser: parseString },
	optionPanelEnable: { protocolName: 'option_panel_enable', parser: parseBoolean },
	optionPanelStatus: { protocolName: 'option_panel_status', parser: parseString },
	optionPanel: { protocolName: 'option_panel', parser: parseString },
}
