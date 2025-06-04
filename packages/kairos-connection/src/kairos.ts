import { BasicKairosConnection, SendResult } from './api.js'
import { CReturnType, Commands } from './commands.js'
import { CustomCommandParameters } from './parameters.js'

export class KairosConnection extends BasicKairosConnection {
	async sendCustom(params: CustomCommandParameters): Promise<APIRequest<Commands.Custom>> {
		return this.executeCommand({
			command: Commands.Custom,
			params,
		})
	}
}
export type APIRequest<C extends Commands> = SendResult<CReturnType<C>>
