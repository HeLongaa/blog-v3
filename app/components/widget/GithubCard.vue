<script setup lang="ts">
const repo = {
	name: 'HeLongaa/blog-v3',
	description: '本站主题 Github 仓库',
	url: 'https://github.com/HeLongaa/blog-v3',
}
</script>

<template>
<ZWidget title="GitHub 仓库">
	<ZRawLink v-if="repo" class="github-card" :to="repo.url">
		<div class="de">
			<div class="name">
				{{ repo.name }}
			</div>
			<div class="desc">
				{{ repo.description }}
			</div>
		</div>
		<div class="img">
			<iconify-icon icon="skill-icons:github-dark" width="26" height="26" />
		</div>
	</ZRawLink>
</ZWidget>
</template>

<style lang="scss" scoped>
.github-card {
    padding: 0.5rem 0.8rem;
    border-radius: 0.8rem;
    background-color: var(--c-bg-2);
    display: flex;
    align-items: center;

    .de {
        flex: 1;
		.name {
			position: relative;
			display: inline-block;

			&::after {
				content: '';
				position: absolute;
				left: 0;
				bottom: 0;
				width: 100%;
				height: 2px;
				background: var(--c-primary);
				transform: scaleX(0);
				transform-origin: left;
				transition: transform 0.3s;
			}
		}
    }

    .img {
        margin-left: 1rem;
        display: flex;
        align-items: center;
    }

    .desc {
        opacity: 0.8;
    }
}
.github-card:hover .name::after {
    transform: scaleX(1);
}
</style>
