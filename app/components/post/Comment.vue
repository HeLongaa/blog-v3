<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()

onMounted(() => {
	// 确保DOM完全加载后再初始化Artalk
	nextTick(() => {
		const initArtalk = () => {
			const artalkEl = document.getElementById('artalk')
			// @ts-expect-error window上有Artalk实例
			if (artalkEl && window.Artalk) {
				try {
					// @ts-expect-error Artalk类型
					window.Artalk.init({
						el: '#artalk',
						pageKey: route.path,
						pageTitle: document.title.replace(` | ${appConfig.title}`, ''),
						server: appConfig.artalk?.server,
						site: appConfig.artalk?.site,
					})
				} catch (error) {
					console.error('Artalk初始化失败:', error)
				}
			} else if (!artalkEl) {
				console.error('未找到#artalk元素')
			} else {
				// 如果元素存在但Artalk还没加载，等待一下再重试
				setTimeout(initArtalk, 200)
			}
		}
		
		// 延迟一点时间确保DOM完全渲染
		setTimeout(initArtalk, 100)
	})
})
</script>

<template>
<section class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>
	<div id="artalk">
		<p>评论加载中...</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

:deep(#artalk) {
	margin: 2em 0;

	.atk-main {
		font-family: inherit;
	}

	.atk-input {
		font-family: var(--font-monospace);
	}

	.atk-time {
		color: var(--c-text-3);
	}

	.atk-content {
		margin-top: 0.1rem;

		img {
			border-radius: 0.5em;
		}
	}

	.atk-nick {
		font-family: var(--font-creative);
		font-weight: bold;
	}

	pre {
		border-radius: 0.5rem;
		font-size: 0.8125rem;
	}

	p {
		margin: 0.2em 0;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding: 0 0 0 1.5em;
		list-style: revert;

		> li {
			margin: 0.2em 0;

			&::marker {
				font-size: 0.8em;
				color: var(--c-primary);
			}
		}
	}

	blockquote {
		margin: 0.5em 0;
		padding: 0.2em 0.5em;
		border-left: 4px solid var(--c-border);
		border-radius: 4px;
		background-color: var(--c-bg-2);
		font-size: 0.9rem;

		> .z-codeblock {
			margin: 0 -0.8rem;
		}
	}

	.atk-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	.atk-footer {
		font-size: 0.7rem;
		color: var(--c-text-3);
	}

	.atk-list-wrap {
		border-radius: 0.5rem;
		transition: background-color 0.1s;
	}
}
</style>
