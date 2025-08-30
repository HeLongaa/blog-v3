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
	background-color: var(--c-bg-a50);
	backdrop-filter: blur(0.5rem);
	border: none;
	border-radius: 0.5rem;
	cursor: pointer;
	font-size: 1.4rem;
	display: block;
	transition: all 0.2s;
	z-index: 100;

	&:hover {
		background-color: var(--c-bg-a80);
		color: var(--c-primary);
	}

	@media (max-width: 768px) {
		bottom: 8rem;
		font-size: 1.4rem;
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