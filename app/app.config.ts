import type { Nav, NavItem } from '~/types/nav'
import blogConfig from '~~/blog.config'

// 图标查询：https://yesicon.app/ph
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	article: {
		categories: <{ [category: string]: { icon: string, color?: string } }>{
			杂谈: { icon: 'ph:chat-bold', color: '#3ba' },
			生活: { icon: 'ph:shooting-star-bold', color: '#f77' },
			未分类: { icon: 'ph:folder-dotted-bold', color: 'rgba(52,73,94,0.81)' },
			云服务: { icon: 'mdi:cloud-outline', color: '#3af' },
			开发运维: { icon: 'simple-icons:devbox', color: '#77f' },
			工具: { icon: 'mynaui:tool', color: '#02941fff' },
			项目: { icon: 'codicon:github', color: '#039e8fff' },
		},
		defaultCategoryIcon: 'ph:folder-bold',
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
	},

	content: {
		/** 代码块自动折叠触发行数 */
		codeblockCollapsibleRows: 16,
		/** 文章开头摘要 */
		excerpt: {
			animation: true,
			caret: '_',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${new Date().getFullYear()} ${blogConfig.author.name}`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'ph:house-bold', text: '个人主页', url: blogConfig.author.homepage },
			{ icon: 'ph:github-logo-bold', text: 'GitHub: HeLongaa', url: 'https://github.com/HeLongaa' },
			{ icon: 'ph:telegram-logo-bold', text: 'Telegram: @BenjaminSmith', url: 'https://t.me/Benjamin_Smith00' },
			{ icon: 'simple-icons:zhihu', text: '知乎: 沉渊', url: 'https://www.zhihu.com/people/yu-luo-wu-sheng-73-99' },
			{ icon: 'ph:rss-simple-bold', text: '本站订阅', url: '/atom.xml' },
			// { icon: 'ph:subway-bold', text: '开往', url: 'https://www.travellings.cn/go-by-clouds.html' },
		] satisfies NavItem[],
		/** 页脚站点地图 */
		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'ph:rss-simple-bold', text: '本站订阅', url: '/atom.xml' },
					{ icon: 'ph:github-logo-bold', text: 'HeLongaa', url: 'https://github.com/HeLongaa' },
					{ icon: 'ph:envelope-simple-bold', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
				],
			},
			{
				title: '说明',
				items: [

					{ icon: 'ph:shield-bold', text: '隐私声明', url: '/info/privacy' },
					{ icon: 'ph:info-bold', text: '免责声明', url: '/info/disclaimer' },
					{ icon: 'ph:arrow-square-out-bold', text: '外链说明', url: '/info/about-link' },
				],
			},
			{
				title: '信息',
				items: [
					{ icon: 'simple-icons:nuxtdotjs', text: '本站原主题', url: 'https://github.com/L33Z22L11/blog-v3' },
					{ icon: 'ph:swatches-bold', text: '主题和组件文档', url: '/theme' },
					{ icon: 'ph:certificate-bold', text: '陇ICP备2024006356号-2', url: 'https://beian.miit.gov.cn/' },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: 'https://oss.helong.online/bucket-IMG/bea2394fef15b88de49ae37707b3c1b86d7dbc2035a752ef2581a8b6cb3b2e8c.png',
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		subtitle: blogConfig.subtitle,
		emojiTail: ['', '🦌', '🙌', '🐟', '🏖️'],
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'ph:files-bold', text: '文章', url: '/' },
				{ icon: 'ph:lightning-bold', text: '瞬间', url: '/talking' },
				{ icon: 'ph:link-bold', text: '友链', url: '/link' },
				{ icon: 'ph:users-bold', text: '朋友动态', url: '/friends' },
				{ icon: 'ph:info-bold', text: '关于', url: '/about' },
				{ icon: 'ph:archive-bold', text: '归档', url: '/archive' },
				{ icon: 'ph:chat-circle-dots-bold', text: '留言板', url: '/messages' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as const,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	stats: {
		/** 归档页面每年标题对应的年龄 */
		birthYear: 2025,
		/** blog-stats widget 的预置文本 */
		wordCount: '约10万',
	},

	themes: {
		light: {
			icon: 'ph:sun-bold',
			tip: '浅色模式',
		},
		system: {
			icon: 'ph:monitor-bold',
			tip: '跟随系统',
		},
		dark: {
			icon: 'ph:moon-bold',
			tip: '深色模式',
		},
	},
})
