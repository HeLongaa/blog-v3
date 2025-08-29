// @keep-sorted
const services = {
	baidu: 'https://image.baidu.com/search/down?url=',
	weserv: 'https://wsrv.nl/?url=',
}

export type ImgService = keyof typeof services | boolean

// https://wsrv.nl/docs/quick-reference.html
export function getGhAvatar(name = '', options: Record<string, any> = { size: 92 }) {
	const srcUrl = `github.com/${name}.png?size=${options.size}`
	delete options.size

	const params = new URLSearchParams(srcUrl)
	Object.entries(options).forEach(([key, value]) => params.set(key, value))
	return services.weserv + params.toString()
}

export const getGhIcon = (name = '') => getGhAvatar(name, { size: 32, mask: 'circle' })

export enum QqAvatarSize {
	Size1080,
	Size40,
	Size40a,
	Size100,
	Size140,
	Size640,
	Size40b = 40,
	Size100a = 100,
	Size640a = 640,
}

// https://users.qzone.qq.com/fcg-bin/cgi_get_portrait.fcg?uins=
export function getQqAvatar(qq = '', size = QqAvatarSize.Size140) {
	return `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=${size}`
}

// https://github.com/microlinkhq/unavatar
// https://docs.webp.se/public-services/unavatar/
export function getFavicon(domain: string, options: Record<string, any> = {
	provider: 'jiangcheng',
	size: 32,
}) {
	const { provider = 'jiangcheng', size = 32 } = options
	
	const services = [
		// 方案1：自定义 favicon 服务
		`https://api.jiangcheng.site/api/favicon?url=${domain}`,
		
		// 方案2：备用 favicon 服务
		`https://favicons.fuzqing.workers.dev/api/getFavicon?url=${domain}&size=${size}`,
	]
	
	// 根据 provider 选择服务
	if (provider === 'fuzqing') {
		return services[1]
	}
	
	// 默认使用第一个服务
	return services[0]
}

export function getImgUrl(src: string, service?: ImgService) {
	if (!service)
		return src
	if (service === true) {
		const autoService = getMainDomain(src) === 'github.com' ? 'weserv' : 'baidu'
		return services[autoService] + src
	}
	if (service in services)
		return services[service] + src
	return src
}
