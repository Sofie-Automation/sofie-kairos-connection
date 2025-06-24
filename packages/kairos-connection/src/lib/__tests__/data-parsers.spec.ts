import { describe, test, expect } from 'vitest'
import {
	parseBoolean,
	stringifyBoolean,
	parseCommaSeparated,
	stringifyCommaSeparated,
	parseInteger,
	stringifyInteger,
	parseFloatValue,
	stringifyFloat,
	parseEnum,
	stringifyEnum,
} from '../data-parsers.js'

enum TestEnum {
	Value1 = 'value1',
	Value2 = 'value2',
}

describe('Data Parsers', () => {
	describe('parseBoolean', () => {
		test('should parse "1" as true', () => {
			expect(parseBoolean('1')).toBe(true)
		})

		test('should parse "0" as false', () => {
			expect(parseBoolean('0')).toBe(false)
		})

		test('should throw error for invalid values', () => {
			expect(() => parseBoolean('true')).toThrow('Unable to parse boolean from string: "true"')
			expect(() => parseBoolean('false')).toThrow('Unable to parse boolean from string: "false"')
			expect(() => parseBoolean('yes')).toThrow('Unable to parse boolean from string: "yes"')
			expect(() => parseBoolean('')).toThrow('Unable to parse boolean from string: ""')
		})
	})

	describe('stringifyBoolean', () => {
		test('should stringify true as "1"', () => {
			expect(stringifyBoolean(true)).toBe('1')
		})

		test('should stringify false as "0"', () => {
			expect(stringifyBoolean(false)).toBe('0')
		})

		test('should return undefined for undefined input', () => {
			expect(stringifyBoolean(undefined)).toBeUndefined()
		})
	})

	describe('parseCommaSeparated', () => {
		test('should parse comma-separated values', () => {
			expect(parseCommaSeparated('a,b,c')).toEqual(['a', 'b', 'c'])
		})

		test('should handle empty string', () => {
			expect(parseCommaSeparated('')).toEqual([])
		})

		test('should filter out empty values', () => {
			expect(parseCommaSeparated('a,,b,c,')).toEqual(['a', 'b', 'c'])
		})

		test('should handle whitespace', () => {
			expect(parseCommaSeparated('a, b , c')).toEqual(['a', ' b ', ' c'])
		})

		test('should handle single value', () => {
			expect(parseCommaSeparated('single')).toEqual(['single'])
		})
	})

	describe('stringifyCommaSeparated', () => {
		test('should join array with commas', () => {
			expect(stringifyCommaSeparated(['a', 'b', 'c'])).toBe('a,b,c')
		})

		test('should handle empty array', () => {
			expect(stringifyCommaSeparated([])).toBe('')
		})

		test('should handle single value', () => {
			expect(stringifyCommaSeparated(['single'])).toBe('single')
		})

		test('should return undefined for undefined input', () => {
			expect(stringifyCommaSeparated(undefined)).toBeUndefined()
		})
	})

	describe('parseInteger', () => {
		test('should parse valid integers', () => {
			expect(parseInteger('123')).toBe(123)
			expect(parseInteger('-456')).toBe(-456)
			expect(parseInteger('0')).toBe(0)
		})

		test('should parse integers with leading/trailing whitespace', () => {
			expect(parseInteger(' 123 ')).toBe(123)
		})

		test('should throw error for invalid values', () => {
			expect(() => parseInteger('abc')).toThrow('Unable to parse integer from string: "abc"')
			expect(parseInteger('12.34')).toBe(12) // parseInt truncates
			expect(() => parseInteger('')).toThrow('Unable to parse integer from string: ""')
		})
	})

	describe('stringifyInteger', () => {
		test('should stringify integers', () => {
			expect(stringifyInteger(123)).toBe('123')
			expect(stringifyInteger(-456)).toBe('-456')
			expect(stringifyInteger(0)).toBe('0')
		})

		test('should return undefined for undefined input', () => {
			expect(stringifyInteger(undefined)).toBeUndefined()
		})
	})

	describe('parseFloatValue', () => {
		test('should parse valid floats', () => {
			expect(parseFloatValue('123.45')).toBe(123.45)
			expect(parseFloatValue('-456.78')).toBe(-456.78)
			expect(parseFloatValue('0')).toBe(0)
			expect(parseFloatValue('0.0')).toBe(0)
		})

		test('should parse scientific notation', () => {
			expect(parseFloatValue('1.23e5')).toBe(123000)
			expect(parseFloatValue('1.23e-5')).toBe(0.0000123)
		})

		test('should throw error for invalid values', () => {
			expect(() => parseFloatValue('abc')).toThrow('Unable to parse float from string: "abc"')
			expect(() => parseFloatValue('')).toThrow('Unable to parse float from string: ""')
		})
	})

	describe('stringifyFloat', () => {
		test('should stringify floats', () => {
			expect(stringifyFloat(123.45)).toBe('123.45')
			expect(stringifyFloat(-456.78)).toBe('-456.78')
			expect(stringifyFloat(0)).toBe('0')
		})

		test('should return undefined for undefined input', () => {
			expect(stringifyFloat(undefined)).toBeUndefined()
		})
	})

	describe('parseEnum', () => {
		test('should parse valid enum values', () => {
			expect(parseEnum('value1', TestEnum)).toBe('value1')
			expect(parseEnum('value2', TestEnum)).toBe('value2')
		})

		test('should throw error for invalid enum values', () => {
			expect(() => parseEnum('invalid', TestEnum)).toThrow(
				'Invalid enum value: "invalid", valid values: value1, value2'
			)
		})
	})

	describe('stringifyEnum', () => {
		test('should stringify valid enum values', () => {
			expect(stringifyEnum(TestEnum.Value1, TestEnum)).toBe('value1')
			expect(stringifyEnum(TestEnum.Value2, TestEnum)).toBe('value2')
		})

		test('should return undefined for undefined input', () => {
			expect(stringifyEnum(undefined, TestEnum)).toBeUndefined()
		})

		test('should throw error for invalid enum values', () => {
			expect(() => stringifyEnum('invalid' as any, TestEnum)).toThrow(
				'Invalid enum value: "invalid", valid values: value1, value2'
			)
		})
	})

	describe('round-trip conversions', () => {
		test('boolean round-trip should preserve values', () => {
			expect(parseBoolean(stringifyBoolean(true))).toBe(true)
			expect(parseBoolean(stringifyBoolean(false))).toBe(false)
		})

		test('integer round-trip should preserve values', () => {
			const values = [0, 1, -1, 123, -456, 999999]
			values.forEach((value) => {
				expect(parseInteger(stringifyInteger(value))).toBe(value)
			})
		})

		test('float round-trip should preserve values', () => {
			const values = [0, 0.0, 1.5, -2.75, 123.456, -999.999]
			values.forEach((value) => {
				expect(parseFloatValue(stringifyFloat(value))).toBe(value)
			})
		})

		test('comma-separated round-trip should preserve values', () => {
			const arrays = [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['single']]
			arrays.forEach((array) => {
				expect(parseCommaSeparated(stringifyCommaSeparated(array))).toEqual(array)
			})
		})

		test('enum round-trip should preserve values', () => {
			const values = [TestEnum.Value1, TestEnum.Value2]

			values.forEach((value) => {
				expect(parseEnum<TestEnum>(stringifyEnum<TestEnum>(value, TestEnum), TestEnum)).toBe(value)
			})
		})
	})
})
