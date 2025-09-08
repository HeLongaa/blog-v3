import blogConfig from '~~/blog.config'

interface CachedData<T = any> {
	data: T
	timestamp: number
	expiry?: number // 缓存过期时间（毫秒）
}

interface MomentItem {
	date: string
	tags: string[]
	content: string
	img?: string
	is_top: boolean
}

interface FriendPost {
	title: string
	link: string
	pubDate: string
	author: string
	feedTitle: string
	content?: string
}

export const useDataCacheStore = defineStore('dataCache', {
	state: () => ({
		cache: new Map<string, CachedData>(),
	}),

	actions: {
		// 设置缓存数据
		setCache<T>(key: string, data: T, expiry = 5 * 60 * 1000) { // 默认5分钟过期
			this.cache.set(key, {
				data,
				timestamp: Date.now(),
				expiry,
			})
		},

		// 获取缓存数据
		getCache<T>(key: string): T | null {
			const cached = this.cache.get(key)
			if (!cached)
				return null

			// 检查是否过期
			if (cached.expiry && (Date.now() - cached.timestamp > cached.expiry)) {
				this.cache.delete(key)
				return null
			}

			return cached.data as T
		},

		// 清除缓存
		clearCache(key?: string) {
			if (key) {
				this.cache.delete(key)
			}
			else {
				this.cache.clear()
			}
		},

		// 检查缓存是否存在且有效
		hasValidCache(key: string): boolean {
			const cached = this.cache.get(key)
			if (!cached)
				return false

			if (cached.expiry && (Date.now() - cached.timestamp > cached.expiry)) {
				this.cache.delete(key)
				return false
			}

			return true
		},

		// 瞬间数据缓存方法
		async getMoments(forceRefresh = false): Promise<MomentItem[]> {
			const cacheKey = 'moments-data'

			if (!forceRefresh && this.hasValidCache(cacheKey)) {
				return this.getCache<MomentItem[]>(cacheKey) || []
			}

			try {
				const response = await $fetch<MomentItem[]>(`${blogConfig.data.api_endpoint}/talk_data.json`)
				if (response && response.length > 0) {
					// 按是否置顶和日期排序
					const sortedData = response.sort((a, b) => {
						if (a.is_top && !b.is_top)
							return -1
						if (!a.is_top && b.is_top)
							return 1
						return new Date(b.date).getTime() - new Date(a.date).getTime()
					})

					this.setCache(cacheKey, sortedData, 3 * 60 * 1000) // 3分钟缓存
					return sortedData
				}
				return []
			}
			catch (error) {
				console.error('获取瞬间数据失败:', error)
				return []
			}
		},

		// 朋友动态数据缓存方法
		async getFriendPosts(forceRefresh = false): Promise<FriendPost[]> {
			const cacheKey = 'friend-posts-data'

			if (!forceRefresh && this.hasValidCache(cacheKey)) {
				return this.getCache<FriendPost[]>(cacheKey) || []
			}

			try {
				const response = await $fetch<FriendPost[]>('/api/friends')
				if (response && response.length > 0) {
					this.setCache(cacheKey, response, 5 * 60 * 1000) // 5分钟缓存
					return response
				}
				return []
			}
			catch (error) {
				console.error('获取朋友动态数据失败:', error)
				return []
			}
		},
	},
})
