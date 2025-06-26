import { describe, test, expect } from 'vitest'
import { protocolEncodeStr, protocolEncodePath, protocolDecodeStr, protocolDecodePath } from '../encode-decode.js'

type RefPath = string[]

describe('Encode/Decode', () => {
	describe('protocolEncodeStr', () => {
		test('should encode special characters', () => {
			expect(protocolEncodeStr(':')).toBe('&#58')
			expect(protocolEncodeStr('.')).toBe('&#46')
			expect(protocolEncodeStr('=')).toBe('&#61')
			expect(protocolEncodeStr('\\')).toBe('&#92')
			expect(protocolEncodeStr('\r')).toBe('&#13')
			expect(protocolEncodeStr('\n')).toBe('&#10')
		})

		test('should encode strings with multiple special characters', () => {
			expect(protocolEncodeStr('test:value')).toBe('test&#58value')
			expect(protocolEncodeStr('file.ext')).toBe('file&#46ext')
			expect(protocolEncodeStr('key=value')).toBe('key&#61value')
			expect(protocolEncodeStr('path\\to\\file')).toBe('path&#92to&#92file')
		})

		test('should encode mixed special characters', () => {
			expect(protocolEncodeStr('test:file.ext=value')).toBe('test&#58file&#46ext&#61value')
			expect(protocolEncodeStr('line1\nline2\r')).toBe('line1&#10line2&#13')
			expect(protocolEncodeStr('complex:path\\file.ext=test\r\n')).toBe(
				'complex&#58path&#92file&#46ext&#61test&#13&#10'
			)
		})

		test('should not encode regular characters', () => {
			expect(protocolEncodeStr('normal text')).toBe('normal text')
			expect(protocolEncodeStr('abc123')).toBe('abc123')
			expect(protocolEncodeStr('')).toBe('')
			expect(protocolEncodeStr('test with spaces')).toBe('test with spaces')
		})

		test('should handle edge cases', () => {
			expect(protocolEncodeStr('')).toBe('')
			expect(protocolEncodeStr('::::')).toBe('&#58&#58&#58&#58')
			expect(protocolEncodeStr('....')).toBe('&#46&#46&#46&#46')
		})
	})

	describe('protocolEncodePath', () => {
		test('should encode simple path arrays', () => {
			const path: RefPath = ['SCENES', 'Scene1', 'Layers']
			expect(protocolEncodePath(path)).toBe('SCENES.Scene1.Layers')
		})

		test('should encode paths with special characters', () => {
			const path: RefPath = ['SCENES', 'Scene:1', 'Layer=Test']
			expect(protocolEncodePath(path)).toBe('SCENES.Scene&#581.Layer&#61Test')
		})

		test('should encode complex paths', () => {
			const path: RefPath = ['SCENES', 'Group\\Scene.1', 'Layers', 'Layer:Test=Value']
			expect(protocolEncodePath(path)).toBe('SCENES.Group&#92Scene&#461.Layers.Layer&#58Test&#61Value')
		})

		test('should handle empty and single-element paths', () => {
			expect(protocolEncodePath([])).toBe('')
			expect(protocolEncodePath(['single'])).toBe('single')
			expect(protocolEncodePath(['special:char'])).toBe('special&#58char')
		})

		test('should encode paths with newlines and carriage returns', () => {
			const path: RefPath = ['SCENES', 'Scene\nName', 'Layer\rTest']
			expect(protocolEncodePath(path)).toBe('SCENES.Scene&#10Name.Layer&#13Test')
		})
	})

	describe('protocolDecodeStr', () => {
		test('should decode special character codes', () => {
			expect(protocolDecodeStr('&#58')).toBe(':')
			expect(protocolDecodeStr('&#46')).toBe('.')
			expect(protocolDecodeStr('&#61')).toBe('=')
			expect(protocolDecodeStr('&#92')).toBe('\\')
			expect(protocolDecodeStr('&#13')).toBe('\r')
			expect(protocolDecodeStr('&#10')).toBe('\n')
		})

		test('should decode strings with encoded characters', () => {
			expect(protocolDecodeStr('test&#58value')).toBe('test:value')
			expect(protocolDecodeStr('file&#46ext')).toBe('file.ext')
			expect(protocolDecodeStr('key&#61value')).toBe('key=value')
			expect(protocolDecodeStr('path&#92to&#92file')).toBe('path\\to\\file')
		})

		test('should decode mixed encoded characters', () => {
			expect(protocolDecodeStr('test&#58file&#46ext&#61value')).toBe('test:file.ext=value')
			expect(protocolDecodeStr('line1&#10line2&#13')).toBe('line1\nline2\r')
			expect(protocolDecodeStr('complex&#58path&#92file&#46ext&#61test&#13&#10')).toBe(
				'complex:path\\file.ext=test\r\n'
			)
		})

		test('should not decode regular text', () => {
			expect(protocolDecodeStr('normal text')).toBe('normal text')
			expect(protocolDecodeStr('abc123')).toBe('abc123')
			expect(protocolDecodeStr('')).toBe('')
			expect(protocolDecodeStr('test with spaces')).toBe('test with spaces')
		})

		test('should handle invalid or incomplete codes', () => {
			expect(protocolDecodeStr('&#')).toBe('&#')
			expect(protocolDecodeStr('&#5')).toBe('&#5')
			expect(protocolDecodeStr('&58')).toBe('&58') // missing #
		})

		test('should handle edge cases', () => {
			expect(protocolDecodeStr('')).toBe('')
			expect(protocolDecodeStr('&#58&#58&#58&#58')).toBe('::::')
			expect(protocolDecodeStr('&#46&#46&#46&#46')).toBe('....')
		})
	})

	describe('protocolDecodePath', () => {
		test('should decode simple encoded paths', () => {
			const result = protocolDecodePath('SCENES.Scene1.Layers')
			expect(result).toEqual(['SCENES', 'Scene1', 'Layers'])
		})

		test('should decode paths with encoded characters', () => {
			const result = protocolDecodePath('SCENES.Scene&#581.Layer&#61Test')
			expect(result).toEqual(['SCENES', 'Scene:1', 'Layer=Test'])
		})

		test('should decode complex paths', () => {
			const result = protocolDecodePath('SCENES.Group&#92Scene&#461.Layers.Layer&#58Test&#61Value')
			expect(result).toEqual(['SCENES', 'Group\\Scene.1', 'Layers', 'Layer:Test=Value'])
		})

		test('should handle empty and single-element paths', () => {
			expect(protocolDecodePath('')).toEqual([])
			expect(protocolDecodePath('single')).toEqual(['single'])
			expect(protocolDecodePath('special&#58char')).toEqual(['special:char'])
		})

		test('should decode paths with newlines and carriage returns', () => {
			const result = protocolDecodePath('SCENES.Scene&#10Name.Layer&#13Test')
			expect(result).toEqual(['SCENES', 'Scene\nName', 'Layer\rTest'])
		})
	})

	describe('round-trip conversions', () => {
		test('string encode/decode should preserve values', () => {
			const testStrings = [
				'normal text',
				'test:value',
				'file.ext',
				'key=value',
				'path\\to\\file',
				'line1\nline2\r',
				'complex:path\\file.ext=test\r\n',
				'',
				'::::',
				'....',
				'special chars: .=\\\r\n all together',
			]

			testStrings.forEach((str) => {
				const encoded = protocolEncodeStr(str)
				const decoded = protocolDecodeStr(encoded)
				expect(decoded).toBe(str)
			})
		})

		test('path encode/decode should preserve values', () => {
			const testPaths: RefPath[] = [
				[],
				['single'],
				['SCENES', 'Scene1', 'Layers'],
				['SCENES', 'Scene:1', 'Layer=Test'],
				['SCENES', 'Group\\Scene.1', 'Layers', 'Layer:Test=Value'],
				['SCENES', 'Scene\nName', 'Layer\rTest'],
				['complex', 'path:with\\special=chars\r\n'],
			]

			testPaths.forEach((path) => {
				const encoded = protocolEncodePath(path)
				const decoded = protocolDecodePath(encoded)
				expect(decoded).toEqual(path)
			})
		})
	})

	describe('character mapping consistency', () => {
		test('all special characters should have consistent encoding', () => {
			const specialChars = [':', '.', '=', '\\', '\r', '\n']
			const expectedCodes = ['&#58', '&#46', '&#61', '&#92', '&#13', '&#10']

			specialChars.forEach((char, index) => {
				const encoded = protocolEncodeStr(char)
				expect(encoded).toBe(expectedCodes[index])

				const decoded = protocolDecodeStr(encoded)
				expect(decoded).toBe(char)
			})
		})

		test('character codes should map to correct ASCII values', () => {
			expect(protocolDecodeStr('&#58')).toBe(String.fromCharCode(58)) // :
			expect(protocolDecodeStr('&#46')).toBe(String.fromCharCode(46)) // .
			expect(protocolDecodeStr('&#61')).toBe(String.fromCharCode(61)) // =
			expect(protocolDecodeStr('&#92')).toBe(String.fromCharCode(92)) // \
			expect(protocolDecodeStr('&#13')).toBe(String.fromCharCode(13)) // \r
			expect(protocolDecodeStr('&#10')).toBe(String.fromCharCode(10)) // \n
		})
	})
})
