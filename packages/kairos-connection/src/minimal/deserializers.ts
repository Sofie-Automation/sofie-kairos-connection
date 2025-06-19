export interface DeserializeResult<TRes> {
	remainingLines: string[]
	response: TRes
}

export function okOrErrorDeserializer(lineBuffer: readonly string[]): DeserializeResult<undefined> | null {
	const firstLine = lineBuffer[0]

	if (firstLine === 'OK') {
		return {
			remainingLines: lineBuffer.slice(1),
			response: undefined,
		}
	} else {
		throw new Error(`okOrErrorDeserializer: Error response received: ${firstLine}`)
	}
}
export function queryAttributeDeserializer(
	lineBuffer: readonly string[],
	path: string
): DeserializeResult<string> | null {
	const firstLine = lineBuffer[0]

	if (firstLine.startsWith(`${path}=`)) {
		const value = firstLine.slice(path.length + 1)
		return {
			remainingLines: lineBuffer.slice(1),
			response: value,
		}
	} else {
		throw new Error(`queryAttributeDeserializer: Error response received: ${firstLine} for path: ${path}`)
	}
}
export function listDeserializer(lineBuffer: readonly string[], path: string): DeserializeResult<string[]> | null {
	const firstLine = lineBuffer[0]

	if (firstLine === `list_ex:${path}=`) {
		const emptyLineIndex = lineBuffer.indexOf('')
		if (emptyLineIndex !== -1) {
			const listItems = lineBuffer.slice(1, emptyLineIndex)

			return {
				remainingLines: lineBuffer.slice(emptyLineIndex + 1),
				response: listItems,
			}
		} else {
			// Data not yet ready, stop processing
			return null
		}
	} else {
		throw new Error(`listDeserializer: Error response received: ${firstLine}`)
	}
}
export function subscribeValueDeserializer(_lineBuffer: readonly string[]): DeserializeResult<undefined> | null {
	throw new Error('Not implemented yet')
}
export function unsubscribeValueDeserializer(_lineBuffer: readonly string[]): DeserializeResult<undefined> | null {
	throw new Error('Not implemented yet')
}
