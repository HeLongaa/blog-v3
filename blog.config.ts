import type { NitroConfig } from 'nitropack'
import type { FeedEntry } from './app/types/feed'
import redirectList from './redirects.json'

export { zhCN as dateLocale } from 'date-fns/locale/zh-CN'

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
const blogConfig = {
	title: '硅基漫游指南',
	subtitle: '等待和犹豫才是这个世界上最无情的杀手',
	// 长 description 利好于 SEO
	description: '硅基漫游指南，分享技术与生活。这个博客记录了在生活和技术学习中的点滴经历，网站界面简洁美观，内容丰富实用，人气互动活跃，涵盖了编程、生活、学习等多个领域。',
	author: {
		name: 'HeLongaa',
		avatar: 'https://oss.helong.online/bucket-IMG/bea2394fef15b88de49ae37707b3c1b86d7dbc2035a752ef2581a8b6cb3b2e8c.png',
		email: 'helong_001@qq.com',
		homepage: 'https://helong.online',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: 'https://oss.helong.online/bucket-IMG/bea2394fef15b88de49ae37707b3c1b86d7dbc2035a752ef2581a8b6cb3b2e8c.png',
	language: 'zh-CN',
	timeEstablished: '2025-07-19',
	timezone: 'Asia/Shanghai',
	url: 'https://blog.helong.online',

	defaultCategory: ['未分类'],

	feed: {
		limit: 50,
	},

	// 在 URL 中隐藏的路径前缀
	hideContentPrefixes: [''],

	imageDomains: [
		// 自动启用本域名的 Nuxt Image
		// 'www.zhilu.site',
		// '7.isyangs.cn',
		// 'oss.helong.online',
	],

	// 禁止搜索引擎收录的路径
	robotsNotIndex: ['/preview', '/previews/*'],

	// 自己部署的 Artalk 服务
	artalk: {
		server: 'https://artalk.helong.online',
		site: '硅基漫游指南',
		// site: 'Local',
	},

	scripts: [
		// Artalk 评论系统
		{ src: `https://artalk.helong.online/dist/Artalk.js`, defer: true },
		{ src: `https://cdn.jsdelivr.net/npm/iconify-icon@3.0.0/dist/iconify-icon.min.js`, defer: true },
	],

	data: {
		api_endpoint: 'https://api-blog.helong.online',
	},
}

// 用于生成 OPML 和友链页面配置
export const myFeed = <FeedEntry>{
	author: blogConfig.author.name,
	sitenick: '摸鱼处',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'EdgeOne'],
	date: blogConfig.timeEstablished,
	comment: '这是我自己',
}

// 将旧页面永久重定向到新页面
const redirectRouteRules = Object.entries(redirectList)
	.reduce<NitroConfig['routeRules']>((acc, [from, to]) => {
		acc![from] = { redirect: { to, statusCode: 301 } }
		return acc
	}, {})

// https://nitro.build/config#routerules
// 使用 EdgeOne 部署时，需要同步更新 edgeone.json
// @keep-sorted
export const routeRules = <NitroConfig['routeRules']>{
	...redirectRouteRules,
	'/api/stats': { prerender: true, headers: { 'Content-Type': 'application/json' } },
	'/atom.xml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
	'/zhilu.opml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
}

export default blogConfig
