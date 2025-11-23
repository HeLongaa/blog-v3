<script setup lang="ts">
import blogConfig from '~~/blog.config'
import { decodeHtmlEntities, stripHtmlAndDecode } from '~/utils/html'

interface FriendPost {
	site_name: string
	title: string
	link: string
	time: string
	readable_time: string
	timestamp: number
	description: string
	icon: string
}

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-log', 'blog-tech', 'comm-group'])

const dataCacheStore = useDataCacheStore()

useSeoMeta({
	title: '朋友动态',
	description: '来自朋友们的最新文章动态',
})

const allPosts = ref<FriendPost[]>([])
const displayedPosts = ref<FriendPost[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const hasMore = ref(true)
const currentIndex = ref(0)
const pageSize = 20

function formatDate(dateStr: string) {
	return dateStr.replace('T', ' ').substring(0, 16)
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
	hasMore.value = endIndex < allPosts.value.length
}

async function loadAllPosts(forceRefresh = false) {
	if (forceRefresh)
		initialLoading.value = true

	loading.value = true

	const resetState = (posts: FriendPost[] = []) => {
		allPosts.value = posts
		displayedPosts.value = []
		currentIndex.value = 0
		hasMore.value = posts.length > 0
		if (posts.length > 0)
			updateDisplayedPosts()
	}

	try {
		const cachedData = dataCacheStore.getCache<FriendPost[]>('friends-posts')
		if (!forceRefresh && cachedData) {
			resetState(cachedData)
			return
		}

		const response = await fetch(`${blogConfig.data.api_endpoint}/freshrss_articles.json`)
		if (!response.ok)
			throw new Error('Failed to fetch')

		const data = await response.json()
		if (Array.isArray(data)) {
			const sortedData = data.sort((a: FriendPost, b: FriendPost) => b.timestamp - a.timestamp)
			dataCacheStore.setCache('friends-posts', sortedData, 5 * 60 * 1000)
			resetState(sortedData)
		}
		else {
			resetState()
		}
	}
	catch (error) {
		console.error('获取朋友动态失败:', error)
		resetState()
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
		updateDisplayedPosts()
		loading.value = false
	}, 300)
}

const { arrivedState } = useScroll(window, { offset: { bottom: 100 } })

watch(() => arrivedState.bottom, (isBottom) => {
	if (isBottom)
		loadMore()
})

onMounted(() => loadAllPosts())
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
	<div v-if="loading && initialLoading" class="loading-container">
		<Icon name="ph:circle-notch" class="loading-icon" />
		<span>加载中...</span>
	</div>

	<TransitionGroup name="post" tag="div" class="post-list" appear>
		<article
			v-for="(post, index) in displayedPosts"
			:key="`${post.site_name}-${post.title}-${index}`"
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
							:src="post.icon"
							:alt="`${post.site_name} avatar`"
							class="author-avatar"
							loading="lazy"
							@error="(e: Event) => {
								const img = e.target as HTMLImageElement;
								if (img) img.src = '/favicon.ico'
							}"
						>
						<div class="author-info">
							<div class="author-details">
								<h3 class="author-name">{{ decodeHtmlEntities(post.site_name) }}</h3>
								<p class="post-domain">{{ post.link.match(/:\/\/([^/]+)/)?.[1] || '' }}</p>
							</div>
						</div>
					</div>

					<div class="post-content">
						<h2 class="post-title">{{ decodeHtmlEntities(post.title) }}</h2>
						<p v-if="post.description" class="post-excerpt">
							{{ stripHtmlAndDecode(post.description).substring(0, 150) }}{{ post.description.length > 150 ? '...' : '' }}
						</p>
					</div>
				</div>

				<time class="post-date">{{ formatDate(post.readable_time) }}</time>
			</a>
		</article>
	</TransitionGroup>

	<div v-if="loading && !initialLoading" class="loading-more">
		<Icon name="ph:circle-notch" class="loading-icon" />
		<span>加载更多...</span>
	</div>

	<div v-if="!hasMore && displayedPosts.length > 0" class="no-more">
		<Icon name="ph:check-circle-bold" />
		<span>已加载全部动态</span>
	</div>

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

.post-enter-active {
  transition: all 0.5s ease;
  transition-delay: var(--delay, 0s);
}

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
</style>
