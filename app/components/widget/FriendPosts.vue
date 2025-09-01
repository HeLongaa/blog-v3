<script setup lang="ts">
import blogConfig from '~~/blog.config'
import { decodeHtmlEntities } from '~/utils/html'
import { getFavicon } from '../../utils/img'

interface FriendPost {
	domain: string
	title: string
	date: string
	link: string
	content: string
	author: string
}

const dataCacheStore = useDataCacheStore()
const posts = ref<FriendPost[]>([])
const loading = ref(true)

// 格式化日期为月日格式
function formatDate(dateStr: string) {
	const date = new Date(dateStr)
	return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 加载数据
async function loadPosts() {
	try {
		// 尝试从缓存获取
		const cachedData = dataCacheStore.getCache<FriendPost[]>('friends-posts')
		if (cachedData && cachedData.length > 0) {
			posts.value = cachedData.slice(0, 3) // 显示前3条
			loading.value = false
			return
		}

		const response = await fetch(`${blogConfig.data.api_endpoint}/rss_data.json`)
		if (!response.ok)
			throw new Error('Failed to fetch')

		const allPosts: FriendPost[] = await response.json()

		// 按时间排序
		allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		// 缓存数据
		dataCacheStore.setCache('friends-posts', allPosts, 5 * 60 * 1000) // 5分钟缓存

		// 显示前3条
		posts.value = allPosts.slice(0, 3)
	}
	catch (error) {
		console.error('Failed to load friend posts:', error)
	}
	finally {
		loading.value = false
	}
}

// 初始加载
onMounted(() => {
	loadPosts()
})
</script>

<template>
<ZWidget title="朋友动态" :card="true">
	<div v-if="loading" class="loading">
		<Icon name="ph:spinner-bold" class="spinning" />
		<span>加载中...</span>
	</div>

	<div v-else-if="posts.length === 0" class="empty">
		<span>暂无动态</span>
	</div>

	<div v-else class="friend-posts">
		<article
			v-for="post in posts"
			:key="`${post.domain}-${post.title}`"
			class="friend-post"
		>
			<div class="post-header">
				<img
					:src="getFavicon(post.domain)"
					:alt="`${post.author}的头像`"
					class="avatar"
					loading="lazy"
					@error="(e) => { (e.target as HTMLImageElement).src = '/favicon.ico' }"
				>
				<div class="post-meta">
					<div class="author">
						{{ decodeHtmlEntities(post.author) }}
					</div>
					<div class="time">
						{{ formatDate(post.date) }}
					</div>
				</div>
			</div>

			<div class="post-content">
				<h3 class="post-title">
					<a :href="post.link" target="_blank" rel="noopener noreferrer">
						{{ decodeHtmlEntities(post.title) }}
					</a>
				</h3>
			</div>
		</article>

		<div class="view-all">
			<ZRawLink to="/friends" class="view-all-link">
				查看全部 <Icon name="ph:arrow-right-bold" />
			</ZRawLink>
		</div>
	</div>
</ZWidget>
</template>

<style lang="scss" scoped>
.loading, .empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--c-text-3);
  font-size: 0.85rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

.friend-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-post {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--c-border);

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .post-meta {
    flex: 1;
    min-width: 0;

    .author {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--c-text-1);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time {
      font-size: 0.7rem;
      color: var(--c-text-3);
      line-height: 1.2;
    }
  }
}

.post-content {
  .post-title {
    margin-bottom: 0;

    a {
      color: var(--c-text-1);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-clamp: 2;
      overflow: hidden;

      &:hover {
        color: var(--c-primary);
      }
    }
  }
}

.view-all {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--c-border);

  .view-all-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--c-primary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      transform: translateX(2px);
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
