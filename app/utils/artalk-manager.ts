/**
 * Artalk 评论系统管理器
 * - 全局单例
 * - 支持 init（完整评论） / loadCountWidget（纯计数）
 */
interface ArtalkOptions {
	el: string
	pageKey: string
	pageTitle: string
	server?: string
	site?: string
	emoticons?: string
	darkMode?: boolean
}

interface CountWidgetOptions {
	server?: string
	site?: string
	pvEl?: string
	countEl?: string
	statPageKeyAttr?: string
}

class ArtalkManager {
	private static instance: ArtalkManager
	private artalkInstance: any = null
	private currentPageKey = ''

	private constructor() {}

	public static getInstance(): ArtalkManager {
		if (!ArtalkManager.instance) {
			ArtalkManager.instance = new ArtalkManager()
		}
		return ArtalkManager.instance
	}

	/* ---------- 完整评论 ---------- */
	public async init(options: ArtalkOptions): Promise<void> {
		if (this.currentPageKey === options.pageKey && this.artalkInstance)
			return
		this.destroy()
		await this.waitForArtalk()
		this.retryUntil(() => {
			const el = document.getElementById(options.el.replace('#', ''))
			/// @ts-expect-error 导入ar
			if (el && window.Artalk) {
				// eslint-disable-next-line ts/ban-ts-comment
				// @ts-expect-error
				this.artalkInstance = window.Artalk.init(options)
				this.currentPageKey = options.pageKey
				return true
			}
			return false
		})
	}

	/* ---------- 纯计数器 ---------- */
	public async loadCountWidget(opts: CountWidgetOptions): Promise<void> {
		await this.waitForArtalk()
		this.retryUntil(() => {
			// @ts-expect-error 加载计数
			if (window.Artalk?.loadCountWidget) {
				// eslint-disable-next-line ts/ban-ts-comment
				// @ts-expect-error
				window.Artalk.loadCountWidget(opts)
				return true
			}
			return false
		})
	}

	/* ---------- 工具方法 ---------- */
	public destroy(): void {
		if (this.artalkInstance?.destroy) {
			// eslint-disable-next-line style/max-statements-per-line
			try { this.artalkInstance.destroy() }
			catch {}
		}
		this.artalkInstance = null
		this.currentPageKey = ''
	}

	public setDarkMode(isDark: boolean): void {
		this.artalkInstance?.setDarkMode?.(isDark)
	}

	private async loadScript(): Promise<void> {
		// 1️⃣ 服务器端直接返回
		if (typeof window === 'undefined')
			return

		// 2️⃣ 已经加载过
		if ((window as any).Artalk)
			return

		return new Promise<void>((resolve, reject) => {
			const script = document.createElement('script')
			script.src = 'https://your-cdn.com/Artalk.js' // 换成你自己的地址
			script.async = true
			script.onload = () => resolve()
			script.onerror = () => reject(new Error('Artalk 脚本加载失败'))
			document.head.appendChild(script)
		})
	}

	private async waitForArtalk(): Promise<void> {
		// 服务器端直接返回
		if (typeof window === 'undefined')
			return

		await this.loadScript()
		return new Promise<void>((res) => {
			const check = () =>
				(window as any).Artalk ? res() : setTimeout(check, 50)
			check()
		})
	}

	private async retryUntil(fn: () => boolean, max = 50): Promise<void> {
		let i = 0
		while (i++ < max) {
			if (fn())
				return
			await new Promise(r => setTimeout(r, 100))
		}
		throw new Error('Artalk 元素或方法未就绪')
	}
}

export default ArtalkManager
