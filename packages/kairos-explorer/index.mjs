import readline from 'node:readline'
import { MinimalKairosConnection } from 'kairos-connection'
import { argv } from 'node:process'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const conn = new MinimalKairosConnection({
	host: argv[2] ?? process.env.HOST,
	port: (argv[3] ? parseInt(argv[3]) : undefined) ?? (process.env.PORT ? parseInt(process.env.PORT) : undefined),
})

function println(text) {
	console.log(text)
	rl.prompt()
}

function handleError(err) {
	if (err instanceof Error) {
		println(err.message)
	} else {
		println(err)
	}
}

conn.connect()

conn.addListener('connect', () => println('Connected'))
conn.addListener('disconnect', () => println('Disconnected'))
conn.addListener('error', () => println('Error'))
conn.addListener('reset', () => println('Application Reset'))

const subs = []

rl.addListener('line', (input) => {
	const [command, ...args] = input.split(' ')
	const arg = args.join(' ')
	if (command === 'list') {
		conn
			.getList(arg)
			.then((value) => {
				println(`${arg}:` + JSON.stringify(value, undefined, 2))
			})
			.catch(handleError)
	} else if (command === 'info') {
		conn
			.executeCommand(`info:${arg}`, 'NakedList', null)
			.then((value) => {
				println(`${arg}:` + JSON.stringify(value, undefined, 2))
			})
			.catch(handleError)
	} else if (command === 'get') {
		conn
			.getAttribute(arg)
			.then((value) => {
				println(`${arg}=` + String(value))
			})
			.catch(handleError)
	} else if (command === 'set') {
		const [arg0, arg1] = arg.split(' ')
		conn
			.setAttribute(arg0, arg1)
			.then(() => {
				println('OK')
			})
			.catch(handleError)
	} else if (command === 'sub') {
		const abort = new AbortController()
		conn.subscribeValue(
			arg,
			abort.signal,
			(path, error, value) => {
				if (error) {
					println('Subscription Error: ' + error.message)
					return
				}
				println(`\n${path}=` + String(value))
			},
			false
		)
		const index = subs.push(abort) - 1
		println(`Subscribed as #${index}`)
	} else if (command === 'unsub') {
		const index = parseInt(arg)
		const abort = subs[index]
		if (!abort) {
			println(`Unknown subscription: #${arg}`)
			return
		}
		abort.abort()
		println(`Unsubscribed #${index}`)
	} else if (command === 'do') {
		const [func, ...args] = arg.split(' ')
		conn
			.executeFunction(func, ...args)
			.then(() => {
				println('OK')
			})
			.catch(handleError)
	} else if (command === 'exit' || command === 'quit') {
		// eslint-disable-next-line n/no-process-exit
		process.exit()
	} else {
		println(`Unknown command: "${command}"`)
	}
})
rl.prompt()
