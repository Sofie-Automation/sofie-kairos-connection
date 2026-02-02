import { OmitReadonly } from '../lib/omit-readonly.js'

// SYS
export interface SystemInfoObject {
	readonly releaseVersion: string
	readonly systemId: string
	var1: string
	var2: string
	var3: string
	var4: string
	var5: string
	var6: string
	var7: string
	var8: string
	readonly smartRoutingEnabled: boolean
}

export interface SystemSettingsObject {
	rawPanelEnable: boolean
	readonly rawPanelStatus: string
	rawPanel1: ConnectionString
	rawPanel2: ConnectionString
	rawPanel3: ConnectionString
	optionPanelEnable: boolean
	readonly optionPanelStatus: string
	optionPanel: ConnectionString
}

/**
 * @example 0.0.0.0:9923
 */
export type ConnectionString = string
// ------------------------- Update* types, used in update* methods --------------------------
export type UpdateSystemInfoObject = OmitReadonly<SystemInfoObject>
export type UpdateSystemSettingsObject = OmitReadonly<SystemSettingsObject>
