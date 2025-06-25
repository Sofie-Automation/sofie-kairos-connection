export type RefPath = string[]

const PROTOCOL_ENCODE_MAP: Record<string, string> = {
	':': '&#58',
	'.': '&#46',
	'=': '&#61',
	'\\': '&#92',
	'\r': '&#13',
	'\n': '&#10',
}
// const PROTOCOL_DECODE_MAP = Object.fromEntries(Object.entries(PROTOCOL_ENCODE_MAP).map(([key, value]) => [value, key]))

const PROTOCOL_ENCODE_REGEXP = /[:.=\\\r\n]/g
const PROTOCOL_DECODE_REGEXP = /&#(\d{2})/g

export function protocolEncodeStr(str: string): string {
	return str.replaceAll(PROTOCOL_ENCODE_REGEXP, (char: string) => PROTOCOL_ENCODE_MAP[char] || char)
}

export function protocolEncodePath(refPath: RefPath): string {
	return refPath.map(protocolEncodeStr).join('.')
}

export function protocolDecodeStr(str: string): string {
	return str.replaceAll(PROTOCOL_DECODE_REGEXP, (_, match: string) => String.fromCharCode(Number(match)) || match)
}

export function protocolDecodePath(encodedStr: string): RefPath {
	if (encodedStr === '') return []
	return encodedStr.split('.').map(protocolDecodeStr)
}
