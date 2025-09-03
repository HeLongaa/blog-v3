const defaultState = {
	sidebar: false,
	aside: false,
	search: false,
}

type LayoutSection = keyof typeof defaultState

export const useLayoutStore = defineStore('layout', () => {
	const open = ref({ ...defaultState })
	const isAnyOpen = computed(() => Object.values(open.value).some(Boolean))

	const asideWidgets = ref<WidgetName[]>([])

	// 滚动锁定逻辑
	const lockScroll = () => {
		if (process.client && document.body) {
			document.body.style.overflow = 'hidden'
		}
	}

	const unlockScroll = () => {
		if (process.client && document.body) {
			document.body.style.overflow = ''
		}
	}

	// 检查是否为移动端或平板端（宽度小于 1200px）
	const isMobileOrTablet = () => {
		return process.client && window.innerWidth < 1200
	}

	const closeAll = () => {
		Object.keys(open.value).forEach((key) => {
			open.value[key as LayoutSection] = false
		})
		unlockScroll()
	}

	const toggle = (key: LayoutSection) => {
		const isActive = open.value[key]
		
		if (isActive) {
			// 关闭当前面板
			open.value[key] = false
			unlockScroll()
		}
		else {
			// 关闭其他面板，打开当前面板
			closeAll()
			open.value[key] = true
			// 只在移动端和平板端锁定滚动
			if (isMobileOrTablet()) {
				lockScroll()
			}
		}
	}

	const setAside = (widgets?: WidgetName[]) => {
		if (widgets)
			asideWidgets.value = widgets ?? []
	}

	const isOpen = (key: LayoutSection) => open.value[key]

	// 监听窗口大小变化，宽屏时解锁滚动
	if (process.client) {
		const handleResize = () => {
			if (window.innerWidth >= 1200 && isAnyOpen.value) {
				unlockScroll()
			}
		}
		
		window.addEventListener('resize', handleResize)
	}

	return {
		open,
		isAnyOpen,
		asideWidgets,
		closeAll,
		toggle,
		setAside,
		isOpen,
	}
})
