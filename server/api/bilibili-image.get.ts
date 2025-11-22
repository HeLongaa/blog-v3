export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const url = query.url as string

	if (!url) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Missing url parameter',
		})
	}

	try {
		// 代理B站图片请求，添加必要的headers避免403
		const response = await fetch(url, {
			headers: {
				'Referer': 'https://www.bilibili.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		})

		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				statusMessage: 'Failed to fetch image',
			})
		}

		// 获取图片数据
		const imageBuffer = await response.arrayBuffer()
		const contentType = response.headers.get('content-type') || 'image/jpeg'

		// 设置响应头
		setResponseHeaders(event, {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400', // 缓存1天
		})

		// 返回图片数据
		return new Uint8Array(imageBuffer)
	}
	catch (error) {
		console.error('获取B站图片失败:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch image',
		})
	}
})
