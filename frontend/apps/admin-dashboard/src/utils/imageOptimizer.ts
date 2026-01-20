/**
 * @fileoverview 图片优化工具
 * @description 提供WebP格式支持、图片懒加载、响应式图片等功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 */

/**
 * WebP支持检测
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * 图片优化配置
 */
export interface ImageOptimizationConfig {
  useWebP: boolean
  lazyLoad: boolean
  quality: number
  sizes: number[]
  formats: string[]
}

/**
 * 默认配置
 */
const defaultConfig: ImageOptimizationConfig = {
  useWebP: true,
  lazyLoad: true,
  quality: 85,
  sizes: [320, 640, 768, 1024, 1280, 1536],
  formats: ['webp', 'jpeg', 'png']
}

/**
 * 图片优化器
 */
export class ImageOptimizer {
  private config: ImageOptimizationConfig
  private webPSupported: boolean = false
  private initialized: boolean = false

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 初始化图片优化器
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    if (this.config.useWebP) {
      this.webPSupported = await supportsWebP()
    }

    this.initialized = true
  }

  /**
   * 获取优化后的图片URL
   */
  getOptimizedUrl(
    originalUrl: string,
    options?: {
      width?: number
      height?: number
      quality?: number
      format?: string
    }
  ): string {
    if (!this.initialized) {
      console.warn('ImageOptimizer not initialized')
      return originalUrl
    }

    const {
      width,
      height,
      quality = this.config.quality,
      format
    } = options || {}

    const url = new URL(originalUrl, window.location.origin)
    const params = new URLSearchParams(url.search)

    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())

    const finalFormat = format || (this.webPSupported ? 'webp' : 'jpeg')
    params.set('f', finalFormat)

    url.search = params.toString()

    return url.toString()
  }

  /**
   * 生成响应式图片源集
   */
  generateSrcSet(
    originalUrl: string,
    options?: {
      widths?: number[]
      quality?: number
    }
  ): string {
    const widths = options?.widths || this.config.sizes
    const quality = options?.quality || this.config.quality

    return widths
      .map((width) => {
        const optimizedUrl = this.getOptimizedUrl(originalUrl, {
          width,
          quality
        })
        return `${optimizedUrl} ${width}w`
      })
      .join(', ')
  }

  /**
   * 生成sizes属性
   */
  generateSizes(breakpoints: string): string {
    return breakpoints
  }

  /**
   * 检查WebP支持
   */
  isWebPSupported(): boolean {
    return this.webPSupported
  }

  /**
   * 预加载图片
   */
  preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 批量预加载图片
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map((url) => this.preloadImage(url))
    await Promise.allSettled(promises)
  }

  /**
   * 获取图片尺寸
   */
  getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 压缩图片质量
   */
  compressImage(
    file: File,
    quality: number = this.config.quality
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 转换为WebP格式
   */
  async convertToWebP(file: File, quality: number = this.config.quality): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert to WebP'))
            }
          },
          'image/webp',
          quality
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
}

/**
 * 创建全局图片优化器实例
 */
export const imageOptimizer = new ImageOptimizer()

/**
 * 图片优化Composable
 */
export function useImageOptimization() {
  const isInitialized = ref(false)
  const webPSupported = ref(false)

  /**
   * 初始化图片优化
   */
  async function initialize() {
    if (!isInitialized.value) {
      await imageOptimizer.initialize()
      isInitialized.value = true
      webPSupported.value = imageOptimizer.isWebPSupported()
    }
  }

  /**
   * 获取优化后的图片URL
   */
  function getOptimizedUrl(
    originalUrl: string,
    options?: {
      width?: number
      height?: number
      quality?: number
      format?: string
    }
  ): string {
    return imageOptimizer.getOptimizedUrl(originalUrl, options)
  }

  /**
   * 生成响应式图片源集
   */
  function generateSrcSet(
    originalUrl: string,
    options?: {
      widths?: number[]
      quality?: number
    }
  ): string {
    return imageOptimizer.generateSrcSet(originalUrl, options)
  }

  /**
   * 预加载图片
   */
  function preloadImage(url: string): Promise<HTMLImageElement> {
    return imageOptimizer.preloadImage(url)
  }

  /**
   * 批量预加载图片
   */
  function preloadImages(urls: string[]): Promise<void> {
    return imageOptimizer.preloadImages(urls)
  }

  /**
   * 压缩图片
   */
  function compressImage(file: File, quality?: number): Promise<Blob> {
    return imageOptimizer.compressImage(file, quality)
  }

  /**
   * 转换为WebP
   */
  function convertToWebP(file: File, quality?: number): Promise<Blob> {
    return imageOptimizer.convertToWebP(file, quality)
  }

  return {
    isInitialized,
    webPSupported,
    initialize,
    getOptimizedUrl,
    generateSrcSet,
    preloadImage,
    preloadImages,
    compressImage,
    convertToWebP
  }
}

/**
 * 图片懒加载指令
 */
export const vLazyLoad = {
  mounted(el: HTMLImageElement, binding: any) {
    const imageUrl = binding.value
    const placeholder = binding.arg || ''

    el.src = placeholder

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = imageUrl
            img.onload = () => {
              img.classList.add('loaded')
            }
            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px'
      }
    )

    observer.observe(el)

    el._lazyLoadObserver = observer
  },
  unmounted(el: HTMLImageElement) {
    if (el._lazyLoadObserver) {
      el._lazyLoadObserver.unobserve(el)
    }
  }
}

/**
 * 响应式图片组件Props
 */
export interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  lazy?: boolean
  placeholder?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  className?: string
}
