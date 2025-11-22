<script setup lang="ts">
import blogConfig, { myFeed } from '~~/blog.config'
import getFeedGroups from '~/feeds'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'friend-posts', 'blog-tech', 'comm-group'])

const { data: postLink } = await useAsyncData('/link', () => queryCollection('content').path('/link').first())
const { data: feeds } = await useAsyncData('feeds', () => getFeedGroups(), { default: () => [] })

useSeoMeta({
	title: '友链',
	ogType: 'profile',
	description: `${appConfig.title}的友链页面，收集了添加他为友链的网站和他订阅的网站列表。`,
})

const copyFields = {
	博主: myFeed.author,
	标题: myFeed.title,
	介绍: myFeed.desc,
	网址: myFeed.link,
	头像: myFeed.avatar,
}

const formData = reactive({
	siteName: '',
	siteLink: '',
	siteAvatar: '',
	siteInfo: '',
	siteRSS: '',
	subMail: '',
})

const submitting = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const showWarnMessage = ref(false)
const showPasteError = ref(false)

async function submitForm() {
	submitting.value = true
	showSuccessMessage.value = false
	showErrorMessage.value = false

	try {
		const formdata = new FormData()
		formdata.append('站点名称', formData.siteName)
		formdata.append('站点链接', formData.siteLink)
		formdata.append('RSS订阅', formData.siteRSS || formData.siteLink)
		formdata.append('站点图标', formData.siteAvatar || formData.siteLink)
		formdata.append('站点描述', formData.siteInfo)
		formdata.append('你的邮箱', formData.subMail)
		formdata.append('submittedAt', new Date().toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		}))

		const requestOptions: RequestInit = {
			method: 'POST',
			body: formdata,
			redirect: 'follow' as RequestRedirect,
		}

		const response = await fetch(`${blogConfig.data.submit_API}`, requestOptions)
		const responseData = await response.json()

		if (response.ok) {
			showSuccessMessage.value = true
			resetForm()
			setTimeout(() => {
				showSuccessMessage.value = false
			}, 4000)
		}
		else if (response.status === 409 || responseData?.code === 409) {
			showWarnMessage.value = true
			console.error(responseData?.code)
			resetForm()
			setTimeout(() => {
				showWarnMessage.value = false
			}, 4000)
		}
		else {
			throw new Error(`提交失败: ${responseData?.code} ${response.statusText}. 响应: ${JSON.stringify(responseData)}`)
		}
	}
	catch (error) {
		console.error('提交失败:', error)
		showErrorMessage.value = true
		setTimeout(() => {
			showErrorMessage.value = false
		}, 5000)
	}
	finally {
		submitting.value = false
	}
}

function resetForm() {
	Object.assign(formData, {
		siteName: '',
		siteLink: '',
		siteAvatar: '',
		siteInfo: '',
		siteRSS: '',
		subMail: '',
	})
}

async function pasteInfo() {
	try {
		const clipboardText = await navigator.clipboard.readText()
		const lines = clipboardText.split('\n').filter(line => line.trim())

		const info = {
			name: '',
			link: '',
			avatar: '',
			descr: '',
			atom: '',
			mail: '',
		}

		// 解析剪贴板内容
		for (const line of lines) {
			const [key, ...valueParts] = line.split(':')
			if (key && valueParts.length > 0) {
				const value = valueParts.join(':').trim()
				const trimmedKey = key.trim().toLowerCase()

				if (trimmedKey === 'name')
					info.name = value
				else if (trimmedKey === 'link')
					info.link = value
				else if (trimmedKey === 'avatar')
					info.avatar = value
				else if (trimmedKey === 'descr')
					info.descr = value
				else if (trimmedKey === 'atom')
					info.atom = value
				else if (trimmedKey === 'mail')
					info.mail = value
			}
		}

		// 验证必填字段
		if (!info.name || !info.link) {
			showPasteError.value = true
			setTimeout(() => {
				showPasteError.value = false
			}, 5000)
			return
		}

		// 填充表单
		Object.assign(formData, {
			siteName: info.name,
			siteLink: info.link,
			siteAvatar: info.avatar,
			siteInfo: info.descr,
			siteRSS: info.atom,
			subMail: info.mail,
		})
	}
	catch (error) {
		console.error('读取剪贴板失败:', error)
		showPasteError.value = true
		setTimeout(() => {
			showPasteError.value = false
		}, 5000)
	}
}
</script>

<template>
<FeedGroup :feeds />

<Tab :tabs="['我的信息', '申请友链']" center>
	<template #tab1>
		<div class="link-tab">
			<FeedCard v-bind="myFeed" />
			<Copy v-for="(code, prompt) in copyFields" :key="prompt" :prompt :code />
		</div>
	</template>
	<template #tab2>
		<ContentRenderer
			v-if="postLink"
			:value="postLink"
			class="article"
		/><p v-else class="text-center">
			可于 link.md 配置友链补充说明。
		</p>

		<!-- 友链申请表单 -->
		<div class="friend-link-form">
			<article class="article md-story">
				<h2 id="友链申请">
					<a href="#友链申请">友链申请</a>
				</h2>
			</article>
			<div class="sub-card">
				<form class="friend-form" @submit.prevent="submitForm">
					<div class="form-item">
						<label class="form-label required" for="form-SiteName">站点名称</label>
						<div class="form-control">
							<input
								id="form-SiteName"
								v-model="formData.siteName"
								type="text"
								class="form-input"
								placeholder="请输入贵站名称"
								required
							>
							<button v-if="formData.siteName" type="button" class="clear-btn" @click="formData.siteName = ''">
								<Icon name="ph:x-bold" />
							</button>
						</div>
					</div>

					<div class="form-item">
						<label class="form-label required" for="form-SiteLink">站点链接</label>
						<div class="form-control">
							<input
								id="form-SiteLink"
								v-model="formData.siteLink"
								type="url"
								class="form-input"
								placeholder="请输入贵站链接"
								required
							>
							<button v-if="formData.siteLink" type="button" class="clear-btn" @click="formData.siteLink = ''">
								<Icon name="ph:x-bold" />
							</button>
						</div>
					</div>

					<div class="form-item">
						<label class="form-label" for="form-siteAvatar">站点图标</label>
						<div class="form-control">
							<input
								id="form-siteAvatar"
								v-model="formData.siteAvatar"
								type="url"
								class="form-input"
								placeholder="不填写则自动获取"
							>
							<button v-if="formData.siteAvatar" type="button" class="clear-btn" @click="formData.siteAvatar = ''">
								<Icon name="ph:x-bold" />
							</button>
						</div>
					</div>

					<div class="form-item">
						<label class="form-label" for="form-siteInfo">站点描述</label>
						<div class="form-control">
							<textarea
								id="form-siteInfo"
								v-model="formData.siteInfo"
								class="form-textarea"
								placeholder="请输入你的站点描述"
								rows="4"
							/>
						</div>
					</div>

					<div class="form-item">
						<label class="form-label" for="form-SiteRSS">RSS订阅</label>
						<div class="form-control">
							<input
								id="form-SiteRSS"
								v-model="formData.siteRSS"
								type="url"
								class="form-input"
								placeholder="用于定时抓取文章更新"
							>
							<button v-if="formData.siteRSS" type="button" class="clear-btn" @click="formData.siteRSS = ''">
								<Icon name="ph:x-bold" />
							</button>
						</div>
					</div>

					<div class="form-item">
						<label class="form-label required" for="form-subMail">你的邮箱</label>
						<div class="form-control">
							<input
								id="form-subMail"
								v-model="formData.subMail"
								type="email"
								class="form-input"
								placeholder="用于接收友链审核结果"
								required
							>
							<button v-if="formData.subMail" type="button" class="clear-btn" @click="formData.subMail = ''">
								<Icon name="ph:x-bold" />
							</button>
						</div>
					</div>

					<div class="form-actions">
						<button type="submit" class="button primary" :disabled="submitting">
							<div class="button-main">
								<Icon name="ph:paper-plane-tilt-bold" />
								{{ submitting ? '提交中...' : '提交申请' }}
							</div>
						</button>
						<button type="button" class="button" @click="pasteInfo">
							<div class="button-main">
								<Icon name="ph:clipboard-bold" />
								粘贴信息
							</div>
						</button>
						<button type="button" class="button" @click="resetForm">
							<div class="button-main">
								<Icon name="ph:arrow-counter-clockwise-bold" />
								重置表单
							</div>
						</button>
					</div>

					<!-- 成功消息 -->
					<Alert v-if="showSuccessMessage" type="tip" title="提交成功">
						<p>友链申请提交成功！我会尽快审核您的申请，审核结果将通过邮箱通知您。</p>
					</Alert>

					<!-- 提交错误消息 -->
					<Alert v-if="showErrorMessage" type="error" title="提交失败">
						<p>提交失败，请检查网络连接后稍后重试。如果问题持续存在，请联系网站管理员。</p>
					</Alert>
					<Alert v-if="showWarnMessage" type="error" title="409 Conflict">
						<p>该链接已存在，请勿重复提交!</p>
					</Alert>

					<!-- 粘贴错误消息 -->
					<Alert v-if="showPasteError" type="error" title="粘贴失败">
						<p>粘贴失败，请检查剪贴板内容格式是否正确。正确格式为：</p>
						<pre>
        name: 站点名称
	link: 站点链接
	avatar: 头像链接
	descr: 站点描述
	atom: RSS链接
	mail: 邮箱地址</pre>
					</Alert>
				</form>
			</div>
		</div>
	</template>
</Tab>

<PostComment />
</template>

<style lang="scss" scoped>
.link-tab {
	margin: 1rem;
}
.center{
	width: auto !important;
}

.friend-link-form {
	margin: 1rem;

}
.sub-card {
	display: block;
	overflow: hidden;
	overflow: clip;
	border-radius: 0.8em;
	box-shadow: 0 0.1em 0.2em var(--ld-shadow);
	background-color: var(--ld-bg-card);
	transition: all 0.2s;
	margin: 0.6rem 0;
}

.friend-form {
	margin-top: 1.5rem;
	padding: 2rem;
}

.form-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 1.5rem;
	font-size: 1rem;
	gap: 1rem;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
	}
}

.form-label {
	flex-shrink: 0;
	padding: 0.65rem;
	text-align: center;
	font-weight: bold;
	color: var(--c-text-1);
	line-height: 1.4;
	position: relative;

	&.required {
		&::after {
			content: '*';
			color: #f56565;
			position: absolute;
			right: -0.5rem;
			top: 0.75rem;
		}
	}
}

.form-control {
	flex: 1;
	position: relative;
}

.form-input, .form-textarea {
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid var(--c-bg-soft);
	border-radius: 0.5rem;
	background-color: var(--ld-bg-card);
	color: var(--c-text-1);
	font-size: 1rem;
	line-height: 1.4;
	transition: all 0.2s ease;
	box-sizing: border-box;
	margin-right: 0.65rem;

	&:focus {
		outline: none;
		border-color: var(--c-primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-primary) 20%, transparent);
		background-color: var(--c-bg);
	}

	&::placeholder {
		color: var(--c-text-3);
	}

	&:hover {
		border-color: var(--c-text-3);
	}

	&:invalid:not(:placeholder-shown) {
		border-color: #f56565;
		box-shadow: 0 0 0 2px color-mix(in srgb, #f56565 20%, transparent);
	}
}

.form-textarea {
	min-height: 100px;
	resize: vertical;
	font-family: inherit;
}

.clear-btn {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: var(--c-text-3);
	cursor: pointer;
	padding: 0.25rem;
	border-radius: 0.25rem;
	transition: color 0.2s ease;

	&:hover {
		color: var(--c-text-1);
		background-color: var(--c-bg-soft);
	}
}

.form-actions {
	display: flex;
	gap: 1rem;
	margin-top: 2rem;
	justify-content: center;

	@media (max-width: 768px) {
		justify-content: center;
		flex-direction: column;
		align-items: stretch;

		.button {
			margin-left: 0;
		}
	}
}

.button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem 1.5rem;
	border: 1px solid var(--c-bg-soft);
	border-radius: 0.5rem;
	background-color: var(--ld-bg-card);
	color: var(--c-text-1);
	font-size: 1rem;
	font-weight: 500;
	line-height: 1.2;
	text-decoration: none;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 0.5rem var(--ld-shadow);

	&:hover {
		box-shadow: 0 0.5em 1em var(--ld-shadow);
		transform: translateY(-2px);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
	}

	&.primary {
		background-color: var(--c-primary);
		color:  #fff;
		border-color: var(--c-primary);

		&:hover:not(:disabled) {
			background-color: color-mix(in srgb, var(--c-primary) 90%, black);
		}
	}

	.button-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
}

.form-input:invalid,
.form-textarea:invalid {
	&:not(:placeholder-shown) {
		border-color: #f56565;
	}
}

.form-input:valid,
.form-textarea:valid {
	&:not(:placeholder-shown) {
		border-color: #48bb78;
	}
}
</style>
