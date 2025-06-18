import type {
	ListParameters,
	QueryValueParameters,
	SetValueParameters,
	SubscribeValueParameters,
	UnsubscribeValueParameters,
} from './parameters.js'

export enum Commands {
	QueryValue = 'QUERY',
	SubscribeValue = 'SUBSCRIBE',
	UnsubscribeValue = 'UNSUBSCRIBE',
	SetValue = 'SET',
	List = 'LIST',
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
	[Commands.QueryValue]: TypedResponseCommand<Commands.QueryValue, QueryValueParameters, unknown>
	[Commands.SubscribeValue]: TypedResponseCommand<Commands.SubscribeValue, SubscribeValueParameters, unknown>
	[Commands.UnsubscribeValue]: TypedResponseCommand<Commands.UnsubscribeValue, UnsubscribeValueParameters, unknown>
	[Commands.SetValue]: TypedResponseCommand<Commands.SetValue, SetValueParameters, unknown>
	[Commands.List]: TypedResponseCommand<Commands.List, ListParameters, unknown>
}

export type QueryValueCommand = AllTypedCommands[Commands.QueryValue]['command']
export type SubscribeValueCommand = AllTypedCommands[Commands.SubscribeValue]['command']
export type UnsubscribeValueCommand = AllTypedCommands[Commands.UnsubscribeValue]['command']
export type SetValueCommand = AllTypedCommands[Commands.SetValue]['command']
export type ListCommand = AllTypedCommands[Commands.List]['command']

export type KairosCommand =
	| QueryValueCommand
	| SubscribeValueCommand
	| UnsubscribeValueCommand
	| SetValueCommand
	| ListCommand
