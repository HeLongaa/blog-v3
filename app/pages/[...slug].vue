<script setup lang="ts">
const route = useRoute()

const layoutStore = useLayoutStore()

const { data: post } = await useAsyncData(
	() => route.path,
	() => queryCollection('content').path(route.path).first(),
)

const excerpt = computed(() => post.value?.description || '')

const showComments = computed(() => {
	const noCommentPages
	= ['/info/privacy', '/info/disclaimer', '/info/about-link']
	if (noCommentPages.includes(route.path)) {
		return false
	}
	return true
})

if (post.value) {
	useSeoMeta({
		title: post.value.title,
		ogType: 'article',
		ogImage: post.value.image,
		description: post.value.description,
	})
	// 如果文章有自定义 aside 配置则使用，否则使用默认的 toc
	const asideWidgets = post.value.meta?.aside || ['toc']
	layoutStore.setAside(asideWidgets as WidgetName[])
}
else {
	route.meta.title = '404'
	layoutStore.setAside(['blog-log'])
}
</script>

<template>
<template v-if="post">
	<PostHeader v-bind="post" />
	<PostExcerpt v-if="excerpt" :excerpt />

	<ContentRenderer
		class="article"
		:class="getPostTypeClassName(post?.type, { prefix: 'md' })"
		:value="post"
		tag="article"
	/>

	<PostFooter v-bind="post" />
	<PostSurround />
	<PostComment v-if="showComments" />
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="内容为空或页面不存在"
/>
</template>
