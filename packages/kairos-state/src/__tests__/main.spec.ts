import { expect, test } from 'vitest'
import { hello } from '../main.js'

test('check export', () => {
	expect(hello).toBe('world2')
})
