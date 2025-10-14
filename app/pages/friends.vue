<script setup lang="ts">
import blogConfig from '~~/blog.config'
import { decodeHtmlEntities, stripHtmlAndDecode } from '~/utils/html'
import { getFavicon } from '~/utils/img'

interface FriendPost {
	domain: string
	title: string
	date: string
	link: string
	content: string
	author: string
}

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-log', 'blog-tech', 'comm-group'])

const dataCacheStore = useDataCacheStore()

useSeoMeta({
	title: '朋友动态',
	description: '来自朋友们的最新文章动态',
})

// 数据状态
const allPosts = ref<FriendPost[]>([])
const displayedPosts = ref<FriendPost[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const hasMore = ref(true)
const currentIndex = ref(0)
const pageSize = 20

// 格式化时间
function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function updateDisplayedPosts() {
	const endIndex = Math.min(currentIndex.value + pageSize, allPosts.value.length)
	const newPosts = allPosts.value.slice(currentIndex.value, endIndex)

	if (newPosts.length === 0) {
		hasMore.value = false
		return
	}

	displayedPosts.value.push(...newPosts)
	currentIndex.value = endIndex

	if (endIndex >= allPosts.value.length) {
		hasMore.value = false
	}
}

// 加载所有文章数据
async function loadAllPosts(forceRefresh = false) {
	if (!initialLoading.value) {
		loading.value = true
	}

	try {
		// 尝试从缓存获取数据
		const cachedData = dataCacheStore.getCache<FriendPost[]>('friends-posts')
		if (!forceRefresh && cachedData) {
			allPosts.value = cachedData
			displayedPosts.value = []
			currentIndex.value = 0
			hasMore.value = cachedData.length > 0
			updateDisplayedPosts()
			return
		}

		const response = await fetch(`${blogConfig.data.api_endpoint}/rss_data.json`)
		if (!response.ok)
			throw new Error('Failed to fetch')

		const data = await response.json()

		if (data && Array.isArray(data)) {
			// 按日期排序
			const sortedData = data.sort((a: FriendPost, b: FriendPost) =>
				new Date(b.date).getTime() - new Date(a.date).getTime(),
			)

			allPosts.value = sortedData
			dataCacheStore.setCache('friends-posts', sortedData, 5 * 60 * 1000) // 5分钟缓存

			// 重置显示状态
			displayedPosts.value = []
			currentIndex.value = 0
			hasMore.value = sortedData.length > 0

			// 加载第一页
			updateDisplayedPosts()
		}
		else {
			allPosts.value = []
			displayedPosts.value = []
			hasMore.value = false
		}
	}
	catch (error) {
		console.error('获取朋友动态失败:', error)
		allPosts.value = []
		displayedPosts.value = []
		hasMore.value = false
	}
	finally {
		loading.value = false
		initialLoading.value = false
	}
}

// 加载更多
function loadMore() {
	if (loading.value || !hasMore.value)
		return

	loading.value = true
	setTimeout(() => {
		updateDisplayedPosts()
		loading.value = false
	}, 300)
}

// 滚动加载

const { arrivedState } = useScroll(window, {
	offset: { bottom: 100 },
})

watch(() => arrivedState.bottom, (isBottom) => {
	if (isBottom) {
		loadMore()
	}
})

// 初始加载
onMounted(() => {
	loadAllPosts()
})
</script>

<template>
<header class="f-header">
	<h3 class="f-title">
		朋友动态
	</h3>
	<p class="f-desc">
		来自朋友们的最新文章动态
	</p>
</header>

<div class="posts-container">
	<!-- 初始加载状态 -->
	<div v-if="initialLoading">
		<div class="loading-container">
			<Icon name="ph:circle-notch" class="loading-icon" />
			<span>正在加载朋友动态...</span>
		</div>

		<!-- 骨架屏 -->
		<div class="skeleton-container">
			<div v-for="i in 3" :key="i" class="skeleton-post">
				<div class="skeleton-header">
					<div class="skeleton-avatar" />
					<div class="skeleton-info">
						<div class="skeleton-name" />
						<div class="skeleton-domain" />
					</div>
				</div>
				<div class="skeleton-content">
					<div class="skeleton-title" />
					<div class="skeleton-text" />
					<div class="skeleton-text short" />
				</div>
			</div>
		</div>
	</div>

	<!-- 文章列表 -->
	<div v-else class="posts-list">
		<TransitionGroup name="post" tag="div" class="post-grid">
			<article
				v-for="(post, index) in displayedPosts"
				:key="`${post.domain}-${post.title}-${index}`"
				class="post-card card"
				:style="{ '--delay': `${(index % pageSize) * 0.05}s` }"
			>
				<a
					:href="post.link"
					target="_blank"
					rel="noopener noreferrer"
					class="post-link"
				>
					<div class="post-main">
						<div class="post-header">
							<img
								:src="getFavicon(post.domain)"
								:alt="`${post.author} avatar`"
								class="author-avatar"
								loading="lazy"
								@error="(e: Event) => {
									const img = e.target as HTMLImageElement;
									if (img && img.src.includes('site-img.helong.online')) {
										img.src = `https://api.jiangcheng.site/api/favicon?url=${post.domain}`
									}
									else if (img && img.src.includes('api.jiangcheng.site')) {
										img.src = '/favicon.ico'
									}
								}"
							>
							<div class="author-info">
								<div class="author-details">
									<h3 class="author-name">{{ decodeHtmlEntities(post.author) }}</h3>
									<p class="post-domain">{{ post.domain }}</p>
								</div>
							</div>
						</div>

						<div class="post-content">
							<h2 class="post-title">{{ decodeHtmlEntities(post.title) }}</h2>
							<p v-if="post.content" class="post-excerpt">
								{{ stripHtmlAndDecode(post.content).substring(0, 150) }}{{ post.content.length > 150 ? '...' : '' }}
							</p>
						</div>
					</div>

					<time class="post-date">{{ formatDate(post.date) }}</time>
				</a>
			</article>
		</TransitionGroup>
	</div>

	<!-- 加载更多 -->
	<div v-if="loading && !initialLoading" class="loading-more">
		<Icon name="ph:circle-notch" class="loading-icon" />
		<span>加载更多...</span>
	</div>

	<!-- 没有更多 -->
	<div v-if="!hasMore && displayedPosts.length > 0" class="no-more">
		<Icon name="ph:check-circle-bold" />
		<span>已加载全部动态</span>
	</div>

	<!-- 空状态 -->
	<div v-if="!initialLoading && !loading && displayedPosts.length === 0" class="empty-state">
		<Icon name="ph:smiley-sad" />
		<p>暂时没有朋友动态</p>
		<button class="retry-btn" @click="loadAllPosts(true)">
			<Icon name="ph:arrow-clockwise-bold" />
			重新加载
		</button>
	</div>
</div>
</template>

<style lang="scss" scoped>
.f-header {
  container-type: inline-size;
  margin: 2rem 1rem;
}

.f-title {
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

.f-title::selection,
.f-header:hover .f-title {
  color: var(--c-text-3);
}

.f-desc {
  text-align: center;
  color: var(--c-text-2);
}

.loading-container,
.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--c-text-2);
  font-size: 1.1rem;

  .loading-icon {
    font-size: 1.5rem;
    animation: spin 1s linear infinite;
    color: var(--c-brand);
  }
}
.posts-container{
  margin: 0 0.5rem
}

.post-card {
  &:hover {
    .post-title {
      color: var(--c-primary);
    }
  }
}

.post-link {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: inherit;
  gap: 1rem;
  background: var(--ld-bg-card);;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--c-border);
  transition: border-color 0.2s ease;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
}

.author-details {
  .author-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--c-text-1);
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }

  .post-domain {
    font-size: 0.8rem;
    color: var(--c-text-3);
    margin: 0;
    line-height: 1;
  }
}

.post-date {
  font-size: 0.85rem;
  color: var(--c-text-3);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    align-self: flex-end;
    margin-top: 0;
  }
}

.post-content {
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
  }

  .post-title {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--c-text-1);
    margin: 0 0 0.25rem 0;
    transition: color 0.3s ease;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @media (max-width: 768px) {
      font-size: 1rem;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }

  .post-excerpt {
    color: var(--c-text-3);
    line-height: 1.4;
    margin: 0;
    font-size: 0.85rem;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @media (max-width: 768px) {
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
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
    margin: 0 0 1.5rem 0;
  }
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: var(--c-brand-dark);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
// 动画
.post-enter-active,
.post-leave-active {
  transition: all 0.5s ease;
}

.post-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.post-leave-to {
  opacity: 0;
  transform: translateY(-30px);
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

// 骨架屏样式
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.skeleton-post {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 1.5rem;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--c-bg-mute);
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  width: 120px;
  height: 16px;
  background: var(--c-bg-mute);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-domain {
  width: 80px;
  height: 12px;
  background: var(--c-bg-mute);
  border-radius: 4px;
}

.skeleton-content {
  .skeleton-title {
    width: 90%;
    height: 20px;
    background: var(--c-bg-mute);
    border-radius: 4px;
    margin-bottom: 0.75rem;
  }

  .skeleton-text {
    width: 100%;
    height: 14px;
    background: var(--c-bg-mute);
    border-radius: 4px;
    margin-bottom: 0.5rem;

    &.short {
      width: 60%;
    }
  }
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
