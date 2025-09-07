<template>
<a
	href="https://linux.do"
	target="_blank"
	rel="noopener noreferrer"
	class="community-link"
>
	<ZWidget
		card
		dim
		title="社区推荐"
		bg-img="https://oss.helong.online/bucket-IMG/3f6a06f102be120040b8a761a4305322c115c2376bbd84e641c294db89d88d43.png"
		bg-right
	>
		<div class="title">
			Linux.do
		</div>

		<Tip icon="oui:empty" :tip-options="{ placement: 'left' }">
			真诚、友善、团结、专业
		</Tip>
	</ZWidget>
</a>
</template>

<style lang="scss" scoped>
.community-link {
	display: block;
	text-decoration: none;
	color: inherit;
	transition: transform 0.2s ease, opacity 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		opacity: 0.9;
	}
}

.title {
	background-clip: text;
	background-image: linear-gradient(60deg, var(--c-accent) -30%, var(--c-primary), var(--c-text-1));
	background-position: 100% 0;
	background-size: 200%;
	font-size: 1.8em;
	font-weight: 800;
	letter-spacing: 0.05em;
	color: transparent;
	transition: background-position 0.2s;

	.widget:hover & {
		background-position: 0 0;
	}
}

.tip {
	margin: 0.2em 0;
	font-size: 0.9em;
}

:deep(.bg-img).bg-img.bg-img {
	opacity: 0.5;
}
</style>
