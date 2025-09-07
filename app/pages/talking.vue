<script setup lang="ts">
import { LazyPopoverLightbox } from '#components'
import { onMounted, onUnmounted, ref } from 'vue'
import { decodeHtmlEntities } from '~/utils/html'

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
	date: string
	tags: string[]
	content: string
	img?: string
	is_top: boolean
}

interface DisplayMoment {
	name: string
	avatar: string
	avatarLink: string
	moment_list: {
		content: string
		date: string
		image?: string[]
		tags?: string[]
		is_top?: boolean
	}[]
}

const allMomentsData = ref<MomentItem[]>([])
const displayedMoments = ref<DisplayMoment[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const hasMore = ref(true)
const currentIndex = ref(0)
const pageSize = 10
function updateDisplayedMoments() {
	const endIndex = Math.min(currentIndex.value + pageSize, allMomentsData.value.length)
	const newMoments = allMomentsData.value.slice(currentIndex.value, endIndex)

	if (newMoments.length === 0) {
		hasMore.value = false
		return
	}
	const displayData: DisplayMoment[] = newMoments.map(item => ({
		name: appConfig.author.name,
		avatar: getGhAvatar(appConfig.author.name),
		avatarLink: '/',
		moment_list: [{
			content: item.content,
			date: formatDate(item.date),
			image: item.img ? [item.img] : undefined,
			tags: item.tags,
			is_top: item.is_top,
		}],
	}))

	displayedMoments.value.push(...displayData)
	currentIndex.value = endIndex

	if (endIndex >= allMomentsData.value.length) {
		hasMore.value = false
	}
}
async function fetchAllMoments(forceRefresh = false) {
	if (loading.value && !initialLoading.value)
		return

	if (initialLoading.value) {
		initialLoading.value = true
	}
	else {
		loading.value = true
	}

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
	}, 300) // 添加轻微延迟以改善用户体验
}
function formatDate(dateString: string) {
	const date = new Date(dateString)
	const now = new Date()
	const diff = now.getTime() - date.getTime()

	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	const month = 30 * day
	const year = 365 * day

	if (diff < hour) {
		const minutes = Math.floor(diff / minute)
		return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
	}
	else if (diff < day) {
		const hours = Math.floor(diff / hour)
		return `${hours}小时前`
	}
	else if (diff < month) {
		const days = Math.floor(diff / day)
		return `${days}天前`
	}
	else if (diff < year) {
		const months = Math.floor(diff / month)
		return `${months}个月前`
	}
	else {
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}
}
function handleScroll() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop
	const windowHeight = window.innerHeight
	const documentHeight = document.documentElement.scrollHeight

	if (scrollTop + windowHeight >= documentHeight - 100) {
		loadMore()
	}
}
function scrollToComment(content: string) {
	const commentSection = document.getElementById('comment-section')
	if (commentSection) {
		commentSection.scrollIntoView({ behavior: 'smooth' })

		setTimeout(() => {
			const textarea = commentSection.querySelector('textarea')
			if (textarea) {
				textarea.focus()
				textarea.value = `> ${content}\n\n`
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

onMounted(() => {
	fetchAllMoments()
	window.addEventListener('scroll', handleScroll)
})

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
	<div v-if="initialLoading">
		<div class="loading-container">
			<Icon name="ph:circle-notch" class="loading-icon" />
			<span>正在加载瞬间...</span>
		</div>

		<!-- 骨架屏 -->
		<div class="skeleton-container">
			<div v-for="i in 3" :key="i" class="skeleton-moment">
				<div class="skeleton-header">
					<div class="skeleton-avatar" />
					<div class="skeleton-info">
						<div class="skeleton-name" />
						<div class="skeleton-date" />
					</div>
				</div>
				<div class="skeleton-content">
					<div class="skeleton-text" />
					<div class="skeleton-text short" />
				</div>
			</div>
		</div>
	</div>

	<!-- 动态列表 -->
	<div v-for="(moment, groupIndex) in displayedMoments" v-else :key="`${groupIndex}-${moment.name}`" class="moment-group">
		<div
			v-for="(item, index) in moment.moment_list"
			:key="`${groupIndex}-${index}`"
			class="moment-item card"
			:class="{ 'is-top': item.is_top }"
			:style="{ '--delay': `${(groupIndex * moment.moment_list.length + index) * 0.1}s` }"
		>
			<!-- 置顶标签 -->
			<div v-if="item.is_top" class="top-badge">
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
						{{ item.date }}
					</div>
				</div>
			</div>

			<div class="moment-content">
				<p class="content-text">
					{{ decodeHtmlEntities(item.content) }}
				</p>
				<div v-if="item.image && item.image.length > 0" class="image-grid">
					<figure
						v-for="(img, imgIndex) in item.image"
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
					<div v-if="item.tags && item.tags.length > 0" class="moment-tags">
						<span v-for="tag in item.tags" :key="tag" class="tag">
							<Icon name="ph:tag-bold" /> {{ tag }}
						</span>
					</div>
				</div>
				<button class="comment-btn" @click="scrollToComment(item.content)">
					<Icon name="hugeicons:comment-01" />
				</button>
			</div>
		</div>
	</div>
</div>

<!-- 加载状态 -->
<div v-if="loading" class="loading-indicator">
	<Icon name="ph:circle-notch" class="loading-icon" />
	<span>加载中...</span>
</div>
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
  position: sticky;
  top: 0;
  margin-bottom: -0.3em;
  z-index: -1;
  font: 800 5em/1 var(--font-stroke-free);
  text-align: center;
  color: transparent;
  -webkit-text-stroke: 1px var(--c-text-3);
  mask-image: linear-gradient(#fff 50%, transparent);
  transition: color 0.2s;
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
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  padding: .9rem;
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

    @media (max-width: 768px) {
      height: 250px;
    }
  }
}

.moment-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* 让底部区域自动推到底部 */

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}

.moment-meta-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.moment-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  background-color: var(--c-bg-2);;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--c-text-2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  &:hover {
    background: var(--c-primary);
    color: var(--c-bg);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
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

@keyframes float-in {
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

// 加载样式
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  // padding: 3rem 2rem;
  color: var(--c-text-2);
  font-size: 1.1rem;

  .loading-icon {
    font-size: 1.5rem;
    animation: spin 1s linear infinite;
    color: var(--c-brand);
  }
}

// 骨架屏样式
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.skeleton-moment {
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
  width: 100px;
  height: 16px;
  background: var(--c-bg-mute);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-date {
  width: 60px;
  height: 12px;
  background: var(--c-bg-mute);
  border-radius: 4px;
}

.skeleton-content {
  .skeleton-text {
    width: 100%;
    height: 14px;
    background: var(--c-bg-mute);
    border-radius: 4px;
    margin-bottom: 0.5rem;

    &.short {
      width: 70%;
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
