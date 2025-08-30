<script setup lang="ts">
const { y: scrollY } = useScroll(window)

// 显示返回顶部按钮
const showBackToTop = computed(() => scrollY.value > 300)

// 返回顶部
function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
}
</script>

<template>
<Transition name="fade">
	<button
		v-if="showBackToTop"
		class="back-to-top"
		aria-label="返回顶部"
		@click="scrollToTop"
	>
		<Icon name="ph:arrow-up-bold" />
	</button>
</Transition>
</template>

<style lang="scss" scoped>
.back-to-top {
	position: fixed;
	bottom: 8rem;
	right: min(2rem, 5%);
	padding: 0.5rem;
	background-color: var(--c-bg-soft);
	backdrop-filter: blur(0.5rem);
	border: 1px solid var(--c-border-light);
	border-radius: 0.5rem;
	cursor: pointer;
	font-size: 1.4rem;
	display: block;
	transition: all 0.2s;
	z-index: 90;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

	&:hover {
		background-color: var(--c-primary);
		color: var(--c-bg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	}

	@media (max-width: 768px) {
		bottom: 8rem;
	}
  @media (max-width: 1080px) and (min-width: 769px) {
    bottom: 5.5rem;
  }
  @media (min-width: 1081px) {
    bottom: 3rem;
  }
  }

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
