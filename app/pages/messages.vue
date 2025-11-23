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
	<div class="welcome-card card">
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
.messages-content {
  display: flex;
  flex-direction: column;
}
.z-comment{
  margin: 0 0.5rem !important;
}
</style>
