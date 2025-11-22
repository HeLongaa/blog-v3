export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const { song_mid } = query

	if (!song_mid || typeof song_mid !== 'string') {
		throw createError({
			statusCode: 400,
			message: 'Missing song_mid parameter',
		})
	}

	try {
		const apiUrl = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify({
			comm: { ct: 24, cv: 0 },
			songinfo: {
				method: 'get_song_detail_yqq',
				param: { song_mid },
				module: 'music.pf_song_detail_svr',
			},
		}))}`

		const response = await $fetch(apiUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Referer': 'https://y.qq.com/',
			},
		})

		return response
	}
	catch (error) {
		console.error('QQ Music API error:', error)
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch music info',
		})
	}
})
