<script setup lang="ts">
useSeoMeta({
	title: '留言板',
	description: '在这里留下你的想法和建议',
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'friend-posts', 'blog-tech', 'comm-group'])
</script>

<template>
<header class="f-header">
	<h3 class="f-title">
		留言板
	</h3>
	<p class="f-desc">
		在这里留下你的建议或者想和我说的话
	</p>
</header>
<div class="messages-content">
	<div class="welcome-card">
		<div class="welcome-icon">
			<Icon name="ph:hand-waving" />
		</div>
		<div class="welcome-text">
			<h3>这里已经存在 <span class="artalk-comment-count">...</span> 条留言</h3>
			<p>这里是大家交流想法、分享心得的地方。你可以：</p>
			<ul>
				<li><Icon name="ph:chat-bold" /> 留下对网站的建议和反馈</li>
				<li><Icon name="ph:lightbulb-bold" /> 分享有趣的想法和见解</li>
				<li><Icon name="ph:users-bold" /> 与其他访客进行友好交流</li>
				<li><Icon name="ph:question-bold" /> 提出你的疑问和问题</li>
			</ul>
		</div>
	</div>
	<p class="notice">
		<Icon name="ph:info-bold" />
		请文明留言，共同维护良好的交流环境
	</p>

	<PostComment />
</div>
</template>

<style lang="scss" scoped>
.f-header {
  container-type: inline-size;
  margin: 2rem 1rem;
}

.f-title {
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

.f-title::selection,
.f-header:hover .f-title {
  color: var(--c-text-3);
}

.f-desc {
  text-align: center;
  color: var(--c-text-2);
}

.messages-content {
  display: flex;
  flex-direction: column;
}
.z-comment{
  margin: 0 0.5rem !important;
}

.welcome-card {
  background: var(--ld-bg-card);
  border-radius: 0.8rem;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.3s ease;
  margin: 0.5rem;
  box-shadow: 0 .1em .2em var(--ld-shadow);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
}

.welcome-icon {
  font-size: 3rem;
  color: var(--c-brand);
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.welcome-text {
  flex: 1;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--c-text-1);
    margin: 0 0 1rem 0;

    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }

  p {
    color: var(--c-text-2);
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--c-text-2);
    font-size: 0.95rem;

    svg {
      color: var(--c-brand);
      font-size: 1.1rem;
      flex-shrink: 0;
    }
  }
}
.notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--c-bg-mute);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin: 1.5rem auto 0;

  svg {
    color: var(--c-brand);
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
}
// 动画效果
.messages-page {
  animation: fade-in 0.6s ease-out;
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

.welcome-card {
  animation: slide-up 0.6s ease-out backwards;
}

.welcome-card { animation-delay: 0.1s; }

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
