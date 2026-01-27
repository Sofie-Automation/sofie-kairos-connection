export type ObjectEncodingDefinition<TObj> = {
	[key in keyof TObj]: ObjectValueEncodingDefinition<TObj, key>
}
export type ObjectValueEncodingDefinition<TObj, TKey extends keyof TObj> = {
	protocolName: string
	parser: (value: string) => TObj[TKey]
	/**
	 * If set, signals that a property is introduced in a certain version.
	 * So if we're communicating with an older version, this property should be ignored.
	 */
	addedInVersion?: {
		v: string
		/** If not supported, return this default value: */
		defaultValue: TObj[TKey]
	}
}

export function getProtocolAttributeNames<TObj>(definition: ObjectEncodingDefinition<TObj>): string[] {
	return Object.values<ObjectValueEncodingDefinition<TObj, any>>(definition).map((attr) => attr.protocolName)
}

export type AttributeUpdates = Array<{ attribute: string; value: string | undefined }>
