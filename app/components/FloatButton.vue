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

<style lang="scss" scoped>
.floating-buttons{
  position:fixed; right:min(2rem,5%); bottom:8rem; z-index:90;
  display:grid; grid-template-rows:0fr;
  transition:grid-template-rows .3s ease;
  pointer-events:none;
  @media (min-width: $breakpoint-widescreen) {
    bottom: 3rem;
  }
  @media (min-width: $breakpoint-mobile) {
    bottom: 5.3rem;
  }
  &.open{ grid-template-rows:1fr; pointer-events:auto; }

  > .inner{
    overflow:hidden;
    background:var(--c-bg-soft); backdrop-filter:blur(.5rem);
    border:1px solid var(--c-border-light); border-radius:.5rem;
  }
}

.floating-btn{
  padding:.5rem; border:0; cursor:pointer;
  font-size:1.4rem; display:block;
  transition:background-color .3s ease, color .3s ease, box-shadow .3s ease;
  &:hover{ background:var(--c-primary); color:var(--c-bg); box-shadow:0 4px 12px #00000040; }
}
</style>
