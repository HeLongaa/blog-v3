<script setup lang="ts">
const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-log', 'blog-tech', 'github-card', 'comm-group'])
useSeoMeta({
	title: '关于',
	ogType: 'profile',
	description: `${appConfig.title}的关于页面，简单介绍了网站和博主的信息。`,
})
</script>

<template>
<div class="main">
	<header class="f-header">
		<h3 class="f-title">
			关于
		</h3>
		<p class="f-desc">
			对于我和这个博客站点的说明，不定时更新
		</p>
	</header>
	<article class="article md-story">
		<h2 id="关于我">
			<a href="#关于我">关于我</a>
		</h2>
		<p>
			我叫HeLong！一个初初初级开发者，会一点前端也会一点后端，水平大概只有AI的万分之一，喜欢逛论坛，喜欢写bug。
		</p>
		<p>平常可能会在一些论坛上看到我，比如<strong>本站友链中的论坛和侧边栏推荐的论坛</strong>。</p>

		<h2 id="关于博客">
			<a href="#关于博客">关于博客</a>
		</h2>
		<p>写博客最开始是在 2024 年，第一个博客运行了大约有6个月左右的时间，因为一些个人身体原因停止掉了，当时使用动态博客，停止之后由于服务器到期等等的一系列原因导致数据也是一点不剩（在互联网档案馆上还是可以看到一些遗迹的）。</p>
		<p>为了防止这种情况的再次发生呢，这次我使用静态博客，这下不用担心数据会丢失了。</p>
		<p>
			这个博客是为了记录我的学习和日常生活而建立和维护的。
			希望写的内容能够或多或少起到一些帮助，这就很好了。
			当然<strong>如果有任何问题，可以随时联系我。我会尽己所能的提供一些帮助，很高兴成为您的朋友。</strong>
		</p>

		<h2 id="常用的技术和工具">
			<a href="#常用的技术和工具">常用的技术和工具</a>
		</h2>
		<div class="skill-list">
			<iconify-icon icon="skill-icons:html" width="48" height="48" />
			<iconify-icon icon="skill-icons:css" width="48" height="48" />
			<iconify-icon icon="skill-icons:javascript" width="48" height="48" />
			<iconify-icon icon="skill-icons:typescript" width="48" height="48" />
			<iconify-icon icon="skill-icons:nuxtjs-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:astro" width="48" height="48" />
			<iconify-icon icon="skill-icons:git" width="48" height="48" />
			<iconify-icon icon="logos:visual-studio-code" width="48" height="48" />
			<iconify-icon icon="skill-icons:anaconda-light" width="48" height="48" />
			<iconify-icon icon="skill-icons:github-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:ubuntu-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:docker" width="48" height="48" />
			<iconify-icon icon="skill-icons:idea-dark" width="48" height="48" />
			<iconify-icon icon="devicon:datagrip" width="48" height="48" />
			<iconify-icon icon="skill-icons:webstorm-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:postman" width="48" height="48" />
			<iconify-icon icon="simple-icons:apifox" width="48" height="48" />
			<iconify-icon icon="skill-icons:vercel-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:cloudflare-dark" width="48" height="48" />
			<iconify-icon icon="skill-icons:netlify-dark" width="48" height="48" />
			<img src="https://oss.helong.online/bucket-IMG/edgeone.ico" width="48" height="48" alt="EdgeOne" class="outimg">
			<iconify-icon icon="hugeicons:chat-gpt" width="48" height="48" />
			<iconify-icon icon="hugeicons:deepseek" width="48" height="48" />
			<iconify-icon icon="material-icon-theme:claude" width="48" height="48" />
			<iconify-icon icon="skill-icons:notion-light" width="48" height="48" />
			<iconify-icon icon="icon-park:more-two" width="48" height="48" />
		</div>
		<h2 id="我的项目">
			<a href="#我的项目">我的项目</a>
		</h2>
		<p>待添加 (还没有想好展示方式）......</p>

		<h2 id="联系我">
			<a href="#联系我">联系我</a>
		</h2>
		<p>你可以通过本站左下角或页脚位置的任何一个联系方式找到我，不出意外我都会进行回复，也可以在本站留言板或任意位置评论区评论。</p>
	</article>
</div>
</template>

<style lang="scss" scoped>
.skill-list{
  iconify-icon{
    margin-right: 0.5rem;
  }
  .outimg{
    display: inline-flex;
    margin-right: 0.5rem;
  }

}
.more-list{
  display:flex;
  gap:4rem;

}

.more-list .list-item{
  color:#222;
  text-decoration:none;
  padding:.25rem 0;
  position:relative;
  transition:color .25s;
}

.more-list .list-item::after{
  content:'';
  position:absolute;
  left:0;
  bottom:0;
  width:0;
  height:1px;
  background:#222;
  transition:width .25s;
}
.more-list .list-item:hover,
.more-list .list-item:focus{
  color:#000;
}
.more-list .list-item:hover::after,
.more-list .list-item:focus::after{
  width:100%;
}
</style>
