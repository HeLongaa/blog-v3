<script setup lang="ts">
import { LazyPopoverLightbox } from '#components'
import ArtalkManager from '~/utils/artalk-manager'

const appConfig = useAppConfig()
const route = useRoute()
const colorMode = useColorMode()

const artalkManager = ArtalkManager.getInstance()
const popoverStore = usePopoverStore()

// 动态加载 KaTeX 脚本
function loadKaTeX() {
	return new Promise((resolve, reject) => {
		if (typeof window !== 'undefined' && window.katex) {
			resolve(window.katex)
			return
		}

		const existingScript = document.querySelector('script[src*="katex"]')
		if (existingScript) {
			existingScript.addEventListener('load', () => resolve(window.katex))
			existingScript.addEventListener('error', reject)
			return
		}

		const script = document.createElement('script')
		script.src = 'https://lib.baomitu.com/KaTeX/0.16.9/katex.min.js'
		script.onload = () => resolve(window.katex)
		script.onerror = reject
		document.head.appendChild(script)
	})
}

// KaTeX math rendering function
async function renderMathInComments() {
	try {
		await loadKaTeX()

		const commentElements = document.querySelectorAll('#artalk .atk-content:not(.math-processed)')
		commentElements.forEach((element: Element) => {
			element.classList.add('math-processed')

			let content = element.innerHTML
			const originalContent = content
			content = content.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
				try {
					return `<span class="math-display">${window.katex.renderToString(formula.trim(), { displayMode: true })}</span>`
				}
				catch (e) {
					console.warn('KaTeX display render error:', e)
					return match
				}
			})
			content = content.replace(/\$([^$\n]+)\$/g, (match, formula) => {
				if (match.includes('<span class="math-')) {
					return match
				}
				try {
					return `<span class="math-inline">${window.katex.renderToString(formula.trim(), { displayMode: false })}</span>`
				}
				catch (e) {
					console.warn('KaTeX inline render error:', e)
					return match
				}
			})
			// eslint-disable-next-line regexp/no-super-linear-backtracking
			content = content.replace(/```math\s*([\s\S]*?)```/g, (match, formula) => {
				try {
					return `<div class="math-block">${window.katex.renderToString(formula.trim(), { displayMode: true })}</div>`
				}
				catch (e) {
					console.warn('KaTeX math block render error:', e)
					return match
				}
			})

			if (content !== originalContent) {
				element.innerHTML = content
			}
		})
	}
	catch (error) {
		console.error('Failed to load KaTeX:', error)
		setTimeout(() => renderMathInComments(), 1000)
	}
}

// 为评论区图片添加灯箱功能
function addLightboxToImages() {
	const commentImages = document.querySelectorAll('#artalk .atk-content img')
	commentImages.forEach((img: Element) => {
		const imgElement = img as HTMLImageElement
		if (imgElement.style.cursor !== 'zoom-in') {
			imgElement.style.cursor = 'zoom-in'
			imgElement.addEventListener('click', () => {
				const { open } = popoverStore.use(() => h(LazyPopoverLightbox, {
					el: imgElement,
				}))
				open()
			})
		}
	})
}
let commentObserver: MutationObserver | null = null

function watchCommentChanges() {
	const artalkContainer = document.getElementById('artalk')
	if (!artalkContainer)
		return
	if (commentObserver) {
		commentObserver.disconnect()
	}
	commentObserver = new MutationObserver((mutations) => {
		let shouldUpdateImages = false
		let shouldRenderMath = false
		mutations.forEach((mutation) => {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const element = node as Element
						if (element.tagName === 'IMG' || element.querySelector('img')) {
							shouldUpdateImages = true
						}
						if (element.classList?.contains('atk-content') || element.querySelector('.atk-content')) {
							shouldRenderMath = true
						}
					}
				})
			}
		})

		if (shouldUpdateImages) {
			setTimeout(() => addLightboxToImages(), 100)
		}
		if (shouldRenderMath) {
			setTimeout(() => renderMathInComments(), 500)
		}
	})

	commentObserver.observe(artalkContainer, {
		childList: true,
		subtree: true,
	})
}

async function initArtalk() {
	try {
		await artalkManager.init({
			el: '#artalk',
			pageKey: route.path,
			pageTitle: document.title.replace(` | ${appConfig.title}`, ''),
			server: appConfig.artalk?.server,
			site: appConfig.artalk?.site,
			emoticons: '/assets/Owo-Artalk.json',
			darkMode: colorMode.value === 'dark',
		})

		await nextTick(() => {
			setTimeout(() => {
				addLightboxToImages()

				setTimeout(() => renderMathInComments(), 1000)
				watchCommentChanges()
			}, 500)
		})
	}
	catch (error) {
		console.error('评论系统初始化失败:', error)
	}
}

onMounted(() => {
	nextTick(() => {
		setTimeout(initArtalk, 100)
	})
})
watch(() => route.path, () => {
	nextTick(() => {
		setTimeout(initArtalk, 100)
	})
})
watch(() => colorMode.value, (newMode) => {
	artalkManager.setDarkMode(newMode === 'dark')
})

onUnmounted(() => {
	if (commentObserver) {
		commentObserver.disconnect()
		commentObserver = null
	}
})
</script>

<template>
<section class="z-comment">
	<h3 class="text-creative">
		<Icon name="iconify i-ph:chat-circle-dots-duotone" class="comment-tip" />评论
	</h3>
	<div id="artalk">
		<p class="loading-box">
			<Icon name="ph:circle-notch" class="loading-icon" />评论加载中...
		</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
  margin: 3rem 0.5rem;

  > h3 {
    margin-top: 3rem;
    margin-left: 0.2rem;
    font-size: 1.25rem;
  }
}
.comment-tip{
  font-size: 1.45rem;
  margin-right: 0.8rem;

}
:deep(#artalk) {
  .loading-box{
    text-align: center;
    font-size: 1.1rem;
  }
  margin-top: 1rem;

  .atk-main-editor {
    border-radius: 0.8rem !important;
    background-color: var(--ld-bg-card);
    box-shadow: 0 0.1em 0.2em var(--ld-shadow);
    border:none !important;
    transition: all 0.2s ease;
    &:hover{
      box-shadow: 0 0.5em 1em var(--ld-shadow);
      transform: translateY(-2px);
    }
  }
  .atk-textarea{
    background-color: var(--ld-bg-card);
  }

  .atk-send-btn {
    background-color: var(--c-primary) !important;
    border-radius: 16px !important;
    transition: all 0.2s;
  }

  .atk-comment-wrap {
    margin: 0.6rem 0;
    background-color: var(--ld-bg-card);;
    border-radius: 0.8rem;
    box-shadow: 0 0.1em 0.2em var(--ld-shadow);
  }

  .atk-comment-wrap .atk-comment {
    padding: 10px;
  }

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
    font-size: 0.9rem !important;
    color: var(--c-brand) !important;
  }

  .atk-reply-at > .atk-nick {
    font-size: 0.8rem !important;
    color: var(--c-brand) !important;
  }

  .atk-comment > .atk-main > .atk-header {
    padding-top: 5px;
  }

  .atk-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .atk-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
  }

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

      span{
        padding: 0 1rem !important;
      }
      &::marker {
        display: none !important;
      }

      &::before {
        display: none !important;
      }
    }
  }
  .atk-list>.atk-list-footer{
    display: none;
  }

  @media (max-width: 576px) {
    .atk-comment-wrap {
      margin: 12px 0;
    }

    .atk-comment-wrap .atk-comment {
      padding: 12px;
    }
  }

  .dark & {
    .atk-comment-wrap {
      background-color: var(--c-bg-2);
    }

    .atk-main-editor {
      background-color: var(--c-bg-2) !important;
      box-shadow: 0 0.1em 0.2em var(--ld-shadow);
      color: var(--c-text-1) !important;
      border:none !important;
    }

    .atk-content p {
      color: var(--c-text-1) !important;
      font-size: 0.9rem !important;
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
    font-family: var(--font-basic);
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

  /* KaTeX math rendering styles */
  .math-block {
    margin: 1rem 0;
    text-align: center;
    overflow-x: auto;
  }

  .katex {
    font-size: 1.1em;
  }

  .katex-display {
    margin: 1rem 0;
    text-align: center;
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
    padding: 1.2rem;
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
