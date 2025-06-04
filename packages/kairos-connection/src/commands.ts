import { CustomCommandParameters } from './parameters.js'

export enum Commands {
	Custom = 'CUSTOM',
}

export interface Command<Cmd extends Commands, Params> {
	readonly command: Cmd
	params: Params
}
/**
 * This interface contains both the command as well as the typings for the return object
 */
export interface TypedResponseCommand<CommandName extends Commands, Params, ReturnType> {
	command: Command<CommandName, Params>
	returnType: ReturnType
}

export type CReturnType<C extends Commands> = AllTypedCommands[C]['returnType']

export interface AllTypedCommands {
	[Commands.Custom]: TypedResponseCommand<Commands.Custom, CustomCommandParameters, unknown>
}

export type CustomCommand = AllTypedCommands[Commands.Custom]['command']

export type KairosCommand = CustomCommand
