import { expect, test } from 'vitest'
import { KairosConnection, MinimalKairosConnection } from '../main.js'

test('check export', () => {
	expect(KairosConnection).not.toBeUndefined()
	expect(MinimalKairosConnection).not.toBeUndefined()
})
