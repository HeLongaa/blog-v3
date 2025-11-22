export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const bvid = query.bvid as string

	if (!bvid) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing bvid parameter',
		})
	}

	try {
		// 使用B站API获取视频信息
		const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
		const response = await $fetch(apiUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Referer': 'https://www.bilibili.com',
			},
		})

		return response
	}
	catch (error) {
		console.error('获取B站视频信息失败:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch video info',
		})
	}
})
