import blogConfig from '~~/blog.config'

interface CachedData<T = any> {
	data: T
	timestamp: number
	expiry?: number // 缓存过期时间（毫秒）
}

interface MomentItem {
	id: number
	content: string
	username: string
	layout: string
	private: boolean
	user_id: number
	extension?: string
	extension_type?: 'WEBSITE' | 'GITHUBPROJ' | 'VIDEO' | 'MUSIC'
	fav_count: number
	created_at: string
	images?: {
		id: number
		message_id: number
		image_url: string
		image_source: string
	}[]
	tags?: {
		id: number
		name: string
		usage_count: number
		created_at: string
	}[]
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

		// 眨间数据获取方法
		async getMoments(_forceRefresh = false): Promise<MomentItem[]> {
			try {
				const response = await $fetch<any>(`${blogConfig.data.Ech0_endpoint}/api/echo/page`)
				if (response && response.code === 1 && response.data && response.data.items) {
					// 按ID降序排列（新的在前）
					return (response.data.items as MomentItem[]).sort((a: MomentItem, b: MomentItem) => b.id - a.id)
				}
				return []
			}
			catch (error) {
				console.error('获取眨间数据失败:', error)
				return []
			}
		},

		// 朋友动态数据获取方法
		async getFriendPosts(_forceRefresh = false): Promise<FriendPost[]> {
			try {
				const response = await $fetch<FriendPost[]>('/api/friends')
				if (response && response.length > 0) {
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
