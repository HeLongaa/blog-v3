<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ label: '2025-08-30', value: '更换框架' },
	{ label: '2025-07-21', value: '博客由GithubPages迁移到EdgeOne' },
	{ label: '2025-05-24', value: '更换框架为Astro' },
	{ label: '2025-05-8', value: '博客上线-部署于GithubPages' },
	{ label: timeEstablished, value: '使用域名: helong.online' },
]
</script>

<template>
<ZWidget card title="更新日志">
	<ZDlGroup size="large" :items="blogLog" />
</ZWidget>
</template>
