import type { FeedGroup } from '~/types/feed'
import { getFavicon, getGhAvatar, getGhIcon, getQqAvatar, QqAvatarSize } from './utils/img'
import blogConfig from '~~/blog.config'

// 获取邻居数据的异步函数
async function getNeighborsData() {
	try {
		const response = await fetch(blogConfig.data.api_endpoint+'/link_data.json')
		if (!response.ok) throw new Error('Failed to fetch neighbors data')
		
		const data = await response.json()
		
		return data.map((item: any) => ({
			author: item.link_name,
			desc: item.link_desc,
			link: item.link_address,
			...(item.link_atom && { feed: item.link_atom }),
			icon: item.link_img,
			avatar: item.link_img,
			archs: ['服务器'],
			date: item.date.split(' ')[0], // 只取日期部分，去掉时间
			comment: '',
		}))
	} catch (error) {
		console.error('Failed to fetch neighbors data:', error)
		return []
	}
}

export default async function getFeedGroups(): Promise<FeedGroup[]> {
	const neighborsEntries = await getNeighborsData()

	return [
		{
			name: '活跃世界',
			desc: '我经常活跃的地方～或者使用的工具～',
			// @keep-sorted { "keys": ["date"] }
			entries: [
				{
					author: 'Linux.do',
					title: 'Linux.do',
					desc: '新的理想型社区',
					link: 'https://linux.do/',
					icon: getFavicon('linux.do'),
					avatar: 'https://oss.helong.online/bucket-IMG/3f6a06f102be120040b8a761a4305322c115c2376bbd84e641c294db89d88d43.png',
					date: '2025-07-21',
					comment: '真诚、友善、团结、专业',
				},
				{
					author: 'NodeSeek',
					desc: '旨在为主机爱好者打造高品质社区，传递行业新闻，分享技术心得。',
					link: 'https://www.nodeseek.com/',
					icon: getFavicon('www.nodeseek.com'),
					avatar: getFavicon('www.nodeseek.com'),
					date: '2025-08-29',
				},
				
			],
		},
		{
			name: '我的邻居',
			desc: '友情需要常联系～～',
			// @keep-sorted { "keys": ["date"] }
			entries: neighborsEntries,
		},
	]
}
