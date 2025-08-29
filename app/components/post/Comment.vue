<script setup lang="ts">
import ArtalkManager from '~/utils/artalk-manager'

const appConfig = useAppConfig()
const route = useRoute()
const colorMode = useColorMode()

const artalkManager = ArtalkManager.getInstance()

const initArtalk = async () => {
  try {
    await artalkManager.init({
      el: '#artalk',
      pageKey: route.path,
      pageTitle: document.title.replace(` | ${appConfig.title}`, ''),
      server: appConfig.artalk?.server,
      site: appConfig.artalk?.site,
      emoticons: "/assets/Owo-Artalk.json",
      darkMode: colorMode.value === 'dark'
    })
  } catch (error) {
    console.error('评论系统初始化失败:', error)
  }
}

onMounted(() => {
  // 确保DOM完全加载后再初始化Artalk
  nextTick(() => {
    setTimeout(initArtalk, 100)
  })
})

// 路由变化时重新初始化
watch(() => route.path, () => {
  nextTick(() => {
    setTimeout(initArtalk, 100)
  })
})

// 监听主题变化
watch(() => colorMode.value, (newMode) => {
  artalkManager.setDarkMode(newMode === 'dark')
})

// 组件卸载时清理
onUnmounted(() => {
  // 注意：这里不要清理全局实例，因为其他页面可能还在使用
  // artalkManager.destroy()
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
	margin-top: 1rem;
	font-family: var(--font-monospace);

	/* 自定义 Artalk 评论样式 */
	.atk-main-editor {
		border-radius: 8px !important;
	}
	
	.atk-send-btn {
		background-color: var(--c-primary) !important;
		border-radius: 16px !important;
	}

	/* 调整评论容器样式 */
	.atk-comment-wrap {
		margin: 16px 0;
		background-color: var(--ld-bg-card);;
		border-radius: 8px;
	}
	
	/* 评论内部padding */
	.atk-comment-wrap .atk-comment {
		padding: 20px 20px 20px 20px;
	}

	/* 子评论样式调整 */
	.atk-comment-children > .atk-comment-wrap {
		margin: 10px 0 0 0;
		background-color: transparent;
		border-radius: 0;
		box-shadow: none;
	}

	.atk-comment > .atk-avatar img {
		border-radius: 50% !important;
	}

	.atk-nick a {
		font-size: 16px !important;
		color: var(--c-brand) !important;
	}
	
	.atk-reply-at > .atk-nick {
		font-size: 14px !important;
		color: var(--c-brand) !important;
	}

	.atk-comment > .atk-main > .atk-header {
		padding-top: 5px;
	}

	.atk-content {
		line-height: 1.6;
	}

	/* 优化评论头部布局 */
	.atk-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	/* 改进评论交互按钮区域 */
	.atk-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 4px;
	}

	/* 美化评论交互按钮 */
	.atk-common-action-btn, .atk-actions span {
		cursor: pointer;
		opacity: 0.8;
		transition: opacity 0.2s;
		
		&:hover {
			opacity: 1;
		}
	}

	.atk-dropdown {
		list-style: none !important;
		margin: 0 !important;
		padding: 0 !important;
		
		.atk-dropdown-item {
			list-style: none !important;
			margin: 0 !important;
			padding: 8px 12px !important;
			
			&::marker {
				display: none !important;
			}
			
			&::before {
				display: none !important;
			}
		}
	}

	/* 移动端适配 */
	@media (max-width: 576px) {
		.atk-comment-wrap {
			margin: 12px 0;
		}
		
		.atk-comment-wrap .atk-comment {
			padding: 12px;
		}
	}

	/* 暗色模式特定样式调整 */
	.dark & {
		.atk-comment-wrap {
			background-color: var(--c-bg-2);
		}
		
		.atk-main-editor {
			background-color: var(--c-bg-2) !important;
			border-color: var(--c-border) !important;
			color: var(--c-text-1) !important;
		}
		
		.atk-send-btn {
			background-color: var(--c-brand) !important;
			
			&:hover {
				background-color: var(--c-brand-light) !important;
			}
		}
		
		.atk-content {
			color: var(--c-text-1) !important;
		}
		
		.atk-nick a {
			color: var(--c-brand-light) !important;
		}
		
		.atk-reply-at > .atk-nick {
			color: var(--c-brand-light) !important;
		}
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

	.atk-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	menu, ol, ul:not(.atk-dropdown) {
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
}
</style>
