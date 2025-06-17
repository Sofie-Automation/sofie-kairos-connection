/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { KairosCommand, Commands } from './commands.js'
import {
	QueryValueParameters,
	SetValueParameters,
	SubscribeValueParameters,
	UnsubscribeValueParameters,
} from './parameters.js'

const setValueSerializer = (_: Commands, { path, value }: SetValueParameters) => `${path}=${value}`
const queryValueSerializer = (_: Commands, { path }: QueryValueParameters) => `${path}`
const subscribeValueSerializer = (_: Commands, { path }: SubscribeValueParameters) => `subscribe:${path}`
const unsubscribeValueSerializer = (_: Commands, { path }: UnsubscribeValueParameters) => `unsubscribe:${path}`
const listSerializer = (_: Commands, { path }: { path: string }) => `list_ex:${path}`

type Serializers<C extends KairosCommand> = {
	[command in C as command['command']]: (c: command['command'], p: command['params']) => string
}

export const serializers: Readonly<Serializers<KairosCommand>> = {
	[Commands.SetValue]: setValueSerializer,
	[Commands.QueryValue]: queryValueSerializer,
	[Commands.SubscribeValue]: subscribeValueSerializer,
	[Commands.UnsubscribeValue]: unsubscribeValueSerializer,
	[Commands.List]: listSerializer,
}
