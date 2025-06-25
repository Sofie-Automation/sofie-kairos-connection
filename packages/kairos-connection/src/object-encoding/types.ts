export type ObjectEncodingDefinition<TObj> = {
	[key in keyof TObj]: ObjectValueEncodingDefinition<TObj, key>
}
export type ObjectValueEncodingDefinition<TObj, TKey extends keyof TObj> = {
	protocolName: string
	parser: (value: string) => TObj[TKey]
}

export function getAttributeNames<TObj>(definition: ObjectEncodingDefinition<TObj>): string[] {
	return Object.values<ObjectValueEncodingDefinition<TObj, any>>(definition).map((attr) => attr.protocolName)
}
