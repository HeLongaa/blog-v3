<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'

const { y: scrollY } = useScroll(window)

const hasComments = ref(false)
const showBackToTop = computed(() => scrollY.value > 300)

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
function scrollToComments() {
	const el = document.querySelector('.z-comment,#artalk,#comments,.comments,[data-comments]')
	el?.scrollIntoView({ behavior: 'smooth' })
}

function checkComments() {
	hasComments.value = !!document.querySelector('.z-comment,#artalk,#comments,.comments,[data-comments]')
}

onMounted(() => {
	checkComments()
	const ob = new MutationObserver(checkComments)
	ob.observe(document.body, { childList: true, subtree: true })
	;[500, 1000, 2000].forEach(t => setTimeout(checkComments, t))
	onUnmounted(() => ob.disconnect())
})
</script>

<template>
<div class="floating-buttons" :class="{ open: showBackToTop || hasComments }">
	<div class="inner">
		<button
			v-if="showBackToTop"
			class="floating-btn back-to-top"
			@click="scrollToTop"
		>
			<Icon name="ph:arrow-fat-lines-up" />
		</button>

		<button
			v-if="hasComments"
			class="floating-btn scroll-to-comments"
			@click="scrollToComments"
		>
			<Icon name="ph:chat-circle-dots-duotone" />
		</button>
	</div>
</div>
</template>
