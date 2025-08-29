/**
 * Artalk 评论系统管理器
 * 确保全局只有一个Artalk实例，避免多页面冲突
 */

interface ArtalkOptions {
  el: string
  pageKey: string
  pageTitle: string
  server?: string
  site?: string
  emoticons?: string
  darkMode?: boolean
}

class ArtalkManager {
  private static instance: ArtalkManager
  private artalkInstance: any = null
  private currentPageKey: string = ''

  private constructor() {}

  public static getInstance(): ArtalkManager {
    if (!ArtalkManager.instance) {
      ArtalkManager.instance = new ArtalkManager()
    }
    return ArtalkManager.instance
  }

  public async init(options: ArtalkOptions): Promise<void> {
    if (this.currentPageKey === options.pageKey && this.artalkInstance) {
      return
    }

    this.destroy()
    await this.waitForArtalk()
    let retryCount = 0
    const maxRetries = 10
    
    while (retryCount < maxRetries) {
      const artalkEl = document.getElementById(options.el.replace('#', ''))
      // @ts-expect-error window上有Artalk实例
      if (artalkEl && window.Artalk) {
        try {
          // @ts-expect-error Artalk类型
          this.artalkInstance = window.Artalk.init(options)
          this.currentPageKey = options.pageKey
          return
        } catch (error) {
          console.error('Artalk初始化失败:', error)
          throw error
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount++
    }
    
    throw new Error(`Artalk元素或脚本未找到`)
  }

  public destroy(): void {
    if (this.artalkInstance) {
      try {
        this.artalkInstance.destroy()
      } catch (error) {
      }
      this.artalkInstance = null
      this.currentPageKey = ''
    }
  }

  public setDarkMode(isDark: boolean): void {
    if (this.artalkInstance && this.artalkInstance.setDarkMode) {
      this.artalkInstance.setDarkMode(isDark)
    }
  }

  private waitForArtalk(): Promise<void> {
    return new Promise((resolve) => {
      // @ts-expect-error window上有Artalk实例
      if (window.Artalk) {
        resolve()
        return
      }

      const checkArtalk = () => {
        // @ts-expect-error window上有Artalk实例
        if (window.Artalk) {
          resolve()
        } else {
          setTimeout(checkArtalk, 100)
        }
      }
      
      setTimeout(checkArtalk, 100)
    })
  }
}

export default ArtalkManager
