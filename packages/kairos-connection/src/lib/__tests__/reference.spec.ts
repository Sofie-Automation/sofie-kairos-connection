import { describe, test, expect } from 'vitest'
import { splitPath } from '../reference.js'

describe('Reference', () => {
	test('splitPath', () => {
		expect(splitPath([])).toStrictEqual([[]])

		expect(splitPath(['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'])).toStrictEqual([
			['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'],
		])

		expect(splitPath(['SCENES', 'Scene1', 'Layers', 'LayerGroup', 'Layer1'], 'Layers')).toStrictEqual([
			['SCENES', 'Scene1'],
			['LayerGroup', 'Layer1'],
		])

		expect(splitPath(['SCENES', 'Scene1', 'Layers'], 'Layers')).toStrictEqual([['SCENES', 'Scene1'], []])

		expect(splitPath(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 'c', 'h')).toStrictEqual([
			['a', 'b'],
			['d', 'e', 'f', 'g'],
			['i', 'j'],
		])
	})
})
