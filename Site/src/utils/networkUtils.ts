export interface CarRequestOptions {
	timeoutMs?: number
	retries?: number
	delayBetweenRetriesMs?: number
	method?: string
}

export const sendCarRequest = async (url: string, opts: CarRequestOptions = {}): Promise<boolean> => {
	const {
		timeoutMs = 4000,
		retries = 1,
		delayBetweenRetriesMs = 150,
		method = 'GET'
	} = opts

	for (let attempt = 0; attempt <= retries; attempt++) {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), timeoutMs)
		try {
			await fetch(url, { method, signal: controller.signal, mode: 'no-cors' })
			clearTimeout(timer)
			return true
		} catch (e) {
			clearTimeout(timer)
			if (attempt === retries) {
				return false
			}
			await new Promise(r => setTimeout(r, delayBetweenRetriesMs))
		}
	}
	return false
}

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))
