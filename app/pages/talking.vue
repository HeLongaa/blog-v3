<script setup lang="ts">
import { LazyPopoverLightbox } from '#components'
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'
import blogConfig from '~~/blog.config'
import VideoEmbed from '~/components/content/VideoEmbed.vue'
import { decodeHtmlEntities } from '~/utils/html'
import { getFavicon } from '~/utils/img'

const appConfig = useAppConfig()
useSeoMeta({
	title: '瞬间',
	description: `记录 ${appConfig.author.name} 的瞬间想法和生活片段。`,
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'friend-posts', 'blog-tech', 'comm-group'])

const dataCacheStore = useDataCacheStore()
const popoverStore = usePopoverStore()

interface MomentItem {
	id: number
	content: string
	username: string
	layout: string
	private: boolean
	user_id: number
	extension?: string
	extension_type?: 'WEBSITE' | 'GITHUBPROJ' | 'VIDEO' | 'YOUTUBE'
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

interface DisplayMoment {
	id: number
	name: string
	avatar: string
	avatarLink: string
	content: string
	date: string
	images?: string[]
	tags?: string[]
	extension?: string
	extension_type?: string
	fav_count: number
	is_top?: boolean
}

const allMomentsData = ref<MomentItem[]>([])
const displayedMoments = ref<DisplayMoment[]>([])
const githubRepoCache = ref<Record<string, any>>({})
const loading = ref(false)
const initialLoading = ref(true)
const hasMore = ref(true)
const currentIndex = ref(0)
const pageSize = 20

const flattenedMoments = computed(() =>
	displayedMoments.value.map((moment, index) => ({ moment, flatIndex: index })),
)

async function fetchGithubRepoInfo(url: string) {
	if (!url || githubRepoCache.value[url])
		return githubRepoCache.value[url] || null

	const match = url.match(/github.com\/([^/]+)\/([^/?#]+)/)
	if (!match) {
		const defaultInfo = {
			name: 'GitHub 项目',
			desc: url,
			logo: '',
			stars: 0,
			forks: 0,
			url,
		}
		githubRepoCache.value[url] = defaultInfo
		return defaultInfo
	}

	try {
		const res = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`)
		if (!res.ok)
			throw new Error('Failed to fetch')

		const data = await res.json()
		githubRepoCache.value[url] = {
			name: data.name,
			desc: data.description,
			logo: data.owner?.avatar_url,
			stars: data.stargazers_count,
			forks: data.forks_count,
			url: data.html_url,
		}
		return githubRepoCache.value[url]
	}
	catch {
		const defaultInfo = {
			name: match[2] || 'GitHub 项目',
			desc: `${match[1]}/${match[2]}`,
			logo: '',
			stars: 0,
			forks: 0,
			url,
		}
		githubRepoCache.value[url] = defaultInfo
		return defaultInfo
	}
}

function isYoutubeVideoId(str: string): boolean {
	return Boolean(str && !str.startsWith('BV') && !str.startsWith('av') && /^[\w-]{11}$/.test(str))
}

function updateDisplayedMoments() {
	const endIndex = Math.min(currentIndex.value + pageSize, allMomentsData.value.length)
	const newMoments = allMomentsData.value.slice(currentIndex.value, endIndex)

	if (newMoments.length === 0) {
		hasMore.value = false
		return
	}

	const displayData: DisplayMoment[] = newMoments.map(item => ({
		id: item.id,
		name: appConfig.author.name,
		avatar: getGhAvatar(appConfig.author.name),
		avatarLink: '/',
		content: item.content,
		date: formatDate(item.created_at),
		images: item.images?.map(img =>
			img.image_url.startsWith('/images/')
				? `${blogConfig.data.Ech0_endpoint}/api${img.image_url}`
				: img.image_url,
		),
		tags: item.tags?.map(tag => tag.name),
		extension: item.extension,
		extension_type: item.extension_type,
		fav_count: item.fav_count,
		is_top: false,
	}))

	displayedMoments.value.push(...displayData)
	currentIndex.value = endIndex
	hasMore.value = endIndex < allMomentsData.value.length
}
async function fetchAllMoments(forceRefresh = false) {
	if (loading.value && !initialLoading.value)
		return

	loading.value = true

	try {
		const data = await dataCacheStore.getMoments(forceRefresh)
		allMomentsData.value = data
		displayedMoments.value = []
		currentIndex.value = 0
		hasMore.value = data.length > 0
		updateDisplayedMoments()
	}
	catch (error) {
		console.error('获取动态数据失败:', error)
		hasMore.value = false
	}
	finally {
		loading.value = false
		initialLoading.value = false
	}
}

function loadMore() {
	if (loading.value || !hasMore.value)
		return

	loading.value = true
	setTimeout(() => {
		updateDisplayedMoments()
		loading.value = false
	}, 300)
}
function formatDate(dateString: string) {
	const diff = Date.now() - new Date(dateString).getTime()
	const minute = 60 * 1000
	const hour = minute * 60
	const day = hour * 24
	const month = day * 30
	const year = day * 365

	if (diff < hour) {
		const minutes = Math.floor(diff / minute)
		return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
	}
	if (diff < day)
		return `${Math.floor(diff / hour)}小时前`
	if (diff < month)
		return `${Math.floor(diff / day)}天前`
	if (diff < year)
		return `${Math.floor(diff / month)}个月前`

	return new Date(dateString).toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

function handleScroll() {
	const { scrollTop } = document.documentElement
	const { innerHeight } = window
	const { scrollHeight } = document.documentElement

	if (scrollTop + innerHeight >= scrollHeight - 100)
		loadMore()
}
function scrollToComment(moment: DisplayMoment) {
	const commentSection = document.getElementById('comment-section')
	if (commentSection) {
		commentSection.scrollIntoView({ behavior: 'smooth' })

		setTimeout(() => {
			const textarea = commentSection.querySelector('textarea')
			if (textarea) {
				textarea.focus()
				textarea.value = `> ${moment.content}\n\n`
				textarea.dispatchEvent(new Event('input', { bubbles: true }))
			}
		}, 500)
	}
}
function openImageLightbox(event: Event) {
	const imgElement = event.target as HTMLImageElement
	if (imgElement && imgElement.tagName === 'IMG') {
		const { open } = popoverStore.use(() => h(LazyPopoverLightbox, {
			el: imgElement,
		}))
		open()
	}
}

function handleExtensionClick(moment: DisplayMoment) {
	if (!moment.extension)
		return

	const urlMap: Record<string, () => string> = {
		WEBSITE: () => {
			try {
				const data = JSON.parse(moment.extension!)
				return data.site || moment.extension!
			}
			catch {
				return moment.extension!
			}
		},
		GITHUBPROJ: () =>
			moment.extension!.startsWith('http')
				? moment.extension!
				: `https://github.com/${moment.extension}`,
	}

	try {
		const getUrl = urlMap[moment.extension_type!]
		const url = getUrl?.()
		if (url)
			window.open(url, '_blank')
	}
	catch (error) {
		console.error('处理扩展内容失败:', error)
	}
}

function parseExtensionData(extension?: string) {
	try {
		return extension ? JSON.parse(extension) : {}
	}
	catch {
		return { title: '链接', site: extension }
	}
}

function getWebsiteIconUrl(url?: string): string {
	if (!url)
		return ''
	try {
		const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
		return getFavicon(urlObj.hostname) || ''
	}
	catch {
		return ''
	}
}

onMounted(() => {
	fetchAllMoments()
	window.addEventListener('scroll', handleScroll)
})

watch(displayedMoments, async (moments) => {
	const fetchHandlers: Record<string, (ext: string) => Promise<any>> = {
		GITHUBPROJ: fetchGithubRepoInfo,
	}

	for (const moment of moments) {
		if (moment.extension && moment.extension_type) {
			const handler = fetchHandlers[moment.extension_type]
			if (handler)
				await handler(moment.extension)
		}
	}
}, { immediate: true })
onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
<!-- <div class="moments-container"> -->
<header class="moments-header">
	<h3 class="moments-title">
		瞬间
	</h3>
	<p class="moments-desc">
		生活需要仪式感，保持记录可以让人变得自律。
	</p>
</header>

<div class="moments-list">
	<!-- 初始加载状态 -->
	<div v-if="loading" class="loading-indicator">
		<Icon name="ph:circle-notch" class="loading-icon" />
		<span>加载中...</span>
	</div>

	<TransitionGroup v-else name="moment" tag="div" appear>
		<div
			v-for="({ moment, flatIndex }) in flattenedMoments"
			:key="`${moment.name}-${flatIndex}`"
			class="moment-item card"
			:class="{ 'is-top': moment.is_top }"
			:style="{ '--delay': `${(flatIndex % pageSize) * 0.05}s` }"
		>
			<!-- 置顶标签 -->
			<div v-if="moment.is_top" class="top-badge">
				<Icon name="ph:push-pin-bold" />
				置顶
			</div>

			<div class="moment-meta">
				<a :href="moment.avatarLink" class="avatar-link">
					<img :src="moment.avatar" :alt="moment.name" class="avatar">
				</a>
				<div class="info">
					<div class="moment-nick">
						{{ moment.name }}
						<Icon name="ph:seal-check-fill" class="verified" />
					</div>
					<div class="moment-date">
						{{ moment.date }}
					</div>
				</div>
			</div>

			<div class="moment-content">
				<p class="content-text">
					{{ decodeHtmlEntities(moment.content) }}
				</p>

				<!-- 扩展内容渲染 -->
				<div v-if="moment.extension_type" class="extension-content">
					<!-- 网站链接 -->
					<div v-if="moment.extension_type === 'WEBSITE'" class="website-card" @click="handleExtensionClick(moment)">
						<img
							v-if="getWebsiteIconUrl(parseExtensionData(moment.extension).site)"
							:src="getWebsiteIconUrl(parseExtensionData(moment.extension).site)"
							alt="网站图标"
							class="website-icon"
							@error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
						>
						<Icon v-else name="ph:globe-simple-bold" class="ext-icon" />
						<div class="ext-info">
							<h4 class="ext-title">
								{{ parseExtensionData(moment.extension).title || '网站链接' }}
							</h4>
							<p class="ext-url">
								{{ parseExtensionData(moment.extension).site }}
							</p>
						</div>
					</div>					<!-- GitHub项目卡片（自动拉取信息） -->
					<div v-else-if="moment.extension_type === 'GITHUBPROJ'" class="github-card" @click="handleExtensionClick(moment)">
						<img
							v-if="moment.extension && githubRepoCache[moment.extension]?.logo"
							:src="githubRepoCache[moment.extension].logo"
							alt="logo"
							class="github-logo"
						>
						<div class="ext-info">
							<h4 class="ext-title">
								{{ moment.extension && githubRepoCache[moment.extension]?.name || 'GitHub 项目' }}
							</h4>
							<p class="ext-desc">
								{{ moment.extension && githubRepoCache[moment.extension]?.desc }}
							</p>
							<div class="ext-meta">
								<span v-if="moment.extension && githubRepoCache[moment.extension]?.stars !== undefined" class="ext-star">
									<Icon name="ph:star-bold" /> {{ moment.extension && githubRepoCache[moment.extension]?.stars }}
								</span>
								<span v-if="moment.extension && githubRepoCache[moment.extension]?.forks !== undefined" class="ext-fork">
									<Icon name="ph:git-fork" /> {{ moment.extension && githubRepoCache[moment.extension]?.forks }}
								</span>
							</div>
						</div>
					</div>

					<!-- 视频 (B站 或 YouTube) -->
					<div v-else-if="moment.extension_type === 'VIDEO' || moment.extension_type === 'YOUTUBE'" class="video-embed-wrapper">
						<VideoEmbed
							:id="moment.extension!"
							:type="moment.extension_type === 'YOUTUBE' || (moment.extension && isYoutubeVideoId(moment.extension)) ? 'youtube' : 'bilibili'"
						/>
					</div>
				</div>				<!-- 图片网格 -->
				<div v-if="moment.images && moment.images.length > 0" class="image-grid">
					<figure
						v-for="(img, imgIndex) in moment.images"
						:key="imgIndex"
						class="grid-item image"
						@click="openImageLightbox"
					>
						<img
							:src="img"
							:alt="`图片 ${imgIndex + 1}`"
							class="grid-img"
							style="cursor: zoom-in;"
						>
					</figure>
				</div>
			</div>

			<div class="moment-bottom">
				<div class="moment-meta-info">
					<div v-if="moment.tags && moment.tags.length > 0" class="moment-tags">
						<span v-for="tag in moment.tags" :key="tag" class="tag">
							<Icon name="ph:tag-bold" /> {{ tag }}
						</span>
					</div>
					<div class="moment-actions">
						<span v-if="moment.fav_count > 0" class="fav-count">
							<Icon name="ph:heart-bold" /> {{ moment.fav_count }}
						</span>
					</div>
				</div>
				<button class="comment-btn" @click="scrollToComment(moment)">
					<Icon name="iconify i-ph:chat-circle-dots-duotone" />
				</button>
			</div>
		</div>
	</TransitionGroup>
</div>

<!-- 加载状态 -->
<div v-if="!hasMore && displayedMoments.length > 0" class="no-more">
	<Icon name="ph:check-circle-bold" />
	<span>已加载全部动态</span>
</div>
<div v-if="!initialLoading && !loading && displayedMoments.length === 0" class="empty-state">
	<Icon name="ph:smiley-sad" />
	<p>暂时还没有动态</p>
</div>
<div id="comment-section">
	<PostComment />
</div>
<!-- </div> -->
</template>

<style lang="scss" scoped>
//.moments-container {
//  max-width: 800px;
//  margin: 0 auto;
//  padding: 0 1rem;
//
//  @media (max-width: 768px) {
//    padding: 1rem 0.5rem;
//  }
//}

.moments-header {
  container-type: inline-size;
  margin: 2rem 1rem;
}

.moments-title {
  color: transparent;
  font-family: var(--font-stroke-free);
  font-size: 5em;
  font-weight: 800;
  line-height: 1;
  margin-bottom: -.3em;
  -webkit-mask-image: linear-gradient(#fff 50%, transparent);
  mask-image: linear-gradient(#fff 50%, transparent);
  opacity: .5;
  position: sticky;
  text-align: center;
  top: 0;
  transition: color .2s;
  z-index: -1;
  -webkit-text-stroke: 1px var(--c-text-3);
}

.moments-title::selection,
.moments-header:hover .moments-title {
  color: var(--c-text-3);
}

.moments-desc {
  text-align: center;
  color: var(--c-text-2);
}

.moments-list {
  margin: 2rem 0.5rem 2rem 0.5rem;
}

.moment-item {
  padding: .9rem;
}

.moment-enter-active {
  transition: all 0.5s ease;
  transition-delay: var(--delay, 0s);
}

.moment-leave-active {
  transition: all 0.5s ease;
}

.moment-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.moment-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.top-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0 15px 0 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);

  &::before {
    position: absolute;
    bottom: -4px;
    right: 0;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid #e55353;
    border-top: 4px solid #e55353;
    filter: brightness(0.8);
  }
}

.moment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;

  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--c-border);

    @media (max-width: 768px) {
      width: 44px;
      height: 44px;
    }
  }

  .info {
    flex: 1;
  }

  .moment-nick {
    font-weight: 600;
    color: var(--c-text-1);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .verified {
      color: var(--c-primary);
      font-size: 1.1em;
    }

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  .moment-date {
    font-size: 0.9rem;
    color: var(--c-text-3);
    margin-top: 0.25rem;
  }
}

.moment-content {
  min-height: 1.5rem;

  .content-text {
    margin: .8rem 1rem 1rem .5rem;
    color: var(--c-text-1);
    white-space: pre-wrap;
    font-size: 1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  /* 当没有图片时，减少底部边距 */
  &:not(:has(.image-grid)) .content-text {
    margin-bottom: 0.5rem;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-left: 0.6rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 0.75rem 0 0.25rem 0;
  }

  .grid-item {
    overflow: hidden;
    border-radius: 0.5rem;
    display: block;
    max-width: 380px;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .grid-img {
    width: 100%;
    object-fit: cover;
    display: block;
    max-height: 250px;
  }
}

.moment-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: auto;
  margin-right: 0.5rem;
  position: relative;
  min-height: 3rem;
}

.moment-meta-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-right: 4rem;
}

.moment-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  background-color: var(--c-bg-2);
  border-radius: 8px;
  margin-left: 0.5rem;
  margin-top: 1rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--c-bg-mute);
  color: var(--c-text-2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--c-border-soft);
  transition: all 0.2s ease;

  &:hover {
    background: var(--c-brand-light);
    color: var(--c-brand);
    border-color: var(--c-brand);
  }
}

.comment-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--c-bg-2);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--c-text-2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: none;

  &:hover {
    background: var(--c-primary);
    color: var(--c-bg);
  }
}

.loading-indicator,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--c-text-2);
  font-size: 0.9rem;

  .loading-icon {
    animation: spin 1s linear infinite;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--c-text-3);

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

// 扩展内容样式
.extension-content {
  margin: 1rem 0.5rem 0.5rem 0.5rem;

  .website-card,
  .github-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--c-bg-2);
    border: 1px solid var(--c-border-soft);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;

    &:hover {
      background: var(--c-bg-2);
      border-color: var(--c-brand);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .ext-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .ext-info {
      flex: 1;
      min-width: 0;

      .ext-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--c-text-1);
        margin: 0 0 0.25rem 0;
        line-height: 1.2;
      }

      .ext-url {
        font-size: 0.9rem;
        color: var(--c-text-2);
        margin: 0;
        word-break: break-all;
        line-height: 1.3;
      }
    }
  }

  .website-card {
		.website-icon {
			width: 48px;
			height: 48px;
			flex-shrink: 0;
			object-fit: contain;
			border-radius: 8px;
		}

		.ext-icon {
			color: #2563eb;
		}
	}

	.github-card .ext-icon {
		color: #333;
		@media (prefers-color-scheme: dark) {
			color: var(--c-text-2);
		}
	}

.github-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	background: var(--c-bg-2);
	border: 1px solid var(--c-border-soft);
	border-radius: 12px;
	padding: 1rem;
	cursor: pointer;
	box-sizing: border-box;

	&:hover {
		background: var(--c-bg-2);
		border-color: var(--c-brand);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.github-logo {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: contain;
		background: #fff;
		border: 1px solid var(--c-border);
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.ext-info {
		flex: 1;
		min-width: 0;

		.ext-title {
			font-size: 1.1rem;
			font-weight: 700;
			color: var(--c-text-1);
			margin: 0 0 0.25rem 0;
			line-height: 1.2;
		}
		.ext-desc {
			font-size: 0.95rem;
			color: var(--c-text-2);
			margin: 0 0 0.5rem 0;
			line-height: 1.3;
			word-break: break-all;
		}
		.ext-meta {
			display: flex;
			gap: 1.2em;
			align-items: center;
			font-size: 0.95rem;
			color: var(--c-text-3);
			.ext-star, .ext-fork {
				display: inline-flex;
				align-items: center;
				gap: 0.3em;
				svg {
					font-size: 1em;
					color: #ffb300;
				}
			}
			.ext-fork svg {
				color: #8e8e8e;
			}
		}
	}
}

  .video-embed-wrapper {
    margin-top: 0.5rem;
    border-radius: 12px;
    overflow: hidden;
    :deep(.video) {
      margin: 0 !important;
      box-shadow: none !important;
      border: 1px solid var(--c-border-soft);
    }
  }

  @media (max-width: 768px) {
    margin: 0.75rem 0 0.25rem 0;

    .website-card,
    .github-card {
      padding: 0.75rem;
      gap: 0.75rem;

      .ext-icon {
        font-size: 2rem;
      }

      .ext-info {
        .ext-title {
          font-size: 0.9rem;
        }

        .ext-url {
          font-size: 0.8rem;
        }

				.ext-author {
					font-size: 0.8rem;
				}
      }
    }
  }
}

// 动作按钮样式
.moment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .fav-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--c-text-3);
    font-size: 0.9rem;

    svg {
      color: #ff6b6b;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  color: var(--c-text-2);
  font-size: 1.1rem;

  .loading-icon {
    font-size: 1.5rem;
    animation: spin 1s linear infinite;
    color: var(--c-brand);
  }
}
</style>
