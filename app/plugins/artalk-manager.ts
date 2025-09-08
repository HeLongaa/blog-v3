/**
 * Artalk 全局插件
 * 在应用级别管理Artalk实例的生命周期
 */

import ArtalkManager from '~/utils/artalk-manager'

export default defineNuxtPlugin(() => {
	const router = useRouter()
	const artalkManager = ArtalkManager.getInstance()

	// 在路由切换前清理Artalk实例
	router.beforeEach(async (to, from) => {
		// 如果从有评论的页面跳转到没有评论的页面，延迟清理
		// 给新页面一些时间来初始化，如果新页面也有评论组件，就不清理
		if (from.path !== to.path) {
			setTimeout(() => {
				// 检查新页面是否有#artalk元素
				const artalkEl = document.getElementById('artalk')
				if (!artalkEl) {
					// 如果新页面没有评论元素，清理实例
					artalkManager.destroy()
				}
			}, 200)
		}
	})

	// 在应用卸载时清理
	if (import.meta.client) {
		window.addEventListener('beforeunload', () => {
			artalkManager.destroy()
		})
	}
})
