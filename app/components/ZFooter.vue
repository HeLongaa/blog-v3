<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
<footer class="z-footer">
	<nav class="footer-nav">
		<div v-for="(group, groupIndex) in appConfig.footer.nav" :key="groupIndex" class="footer-nav-group">
			<h3 v-if="group.title">
				{{ group.title }}
			</h3>
			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<ZRawLink :to="item.url">
						<Icon :name="item.icon" />
						<span class="nav-text">{{ item.text }}</span>
					</ZRawLink>
				</li>
			</menu>
		</div>
	</nav>
	<div class="footer-bottom">
		<p>
			本站由 HeLong 使用<ProseA href="https://github.com/HeLongaa/blog-v3">
      纸鹿的开源博客
			</ProseA> 主题创建。
		</p>
		<p>
			本博客所有文章除特别声明外，均采用    <ProseA :href="appConfig.copyright.url">
				CC BY-NC-SA 4.0
			</ProseA>    许可协议。
		</p>
		<p>
			完整转载请注明来自 <Badge link="https://blog.helong.online">硅基漫游指南</Badge>
		</p>
	</div>
</footer>
</template>

<style lang="scss" scoped>
.z-footer {
	margin: 3rem 1rem;
	font-size: 0.9em;
	color: var(--c-text-2);

	.footer-nav {
		display: flex;
		justify-content: space-between;
		padding-block: 1.5rem;

		.footer-nav-group{
			flex: 1;
			min-width: 0;
		}

		@media (max-width: 489px) {
			flex-direction: column;
			gap: 2rem;

			.footer-nav-group{
				flex: none;
				text-align: center;

				menu {
					display: flex;
					flex-direction: column;
					align-items: center;
				}
			}
		}
		h3 {
			margin: 0.5em;
			font: inherit;
		}

		a {
			display: flex;
			align-items: center;
			gap: 0.3em;
			width: fit-content;
			padding: 0.3em 0.5em;
			border-radius: 0.5em;
			font-size: 0.9em;
			transition: background-color 0.2s, color 0.1s;

			&:hover {
				background-color: var(--c-bg-soft);
				color: var(--c-text);
			}
		}
	}

	p {
		margin: 0.5em;
	}

	.footer-bottom {
		text-align: center;

		p {
			margin: 0.5rem 0;
			font-size: 0.85rem;
			line-height: 1.5;
			//display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.3rem;

			:deep(.iconify) {
				width: 1em;
				height: 1em;
				vertical-align: middle;
			}

			a {
				position: relative;
				color: inherit;
				text-decoration: none;
				transition: color 0.3s ease;

				&::after {
					content: '';
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 0;
					height: 1px;
					background-color: var(--c-primary);
					transition: width 0.3s ease;
				}

				&:hover {
					color: var(--c-primary);

					&::after {
						width: 100%;
					}
				}
			}

		}
	}
}
</style>
