/**
 * YYC³餐饮行业智能化平台 - 懒加载工具
 */

// 图片懒加载观察器
export class ImageLazyLoader {
  private observer: IntersectionObserver
  private loadedImages = new WeakSet<HTMLImageElement>()

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          this.loadImage(img)
        }
      })
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })
  }

  private loadImage(img: HTMLImageElement) {
    if (this.loadedImages.has(img)) return

    const src = img.dataset.src
    if (src) {
      img.src = src
      img.classList.add('loaded')
      this.loadedImages.add(img)
      this.observer.unobserve(img)
    }
  }

  observe(img: HTMLImageElement) {
    if (img.complete || this.loadedImages.has(img)) return
    this.observer.observe(img)
  }

  disconnect() {
    this.observer.disconnect()
  }
}

// 组件懒加载工具
export function lazyLoadComponent<T>(
  loader: () => Promise<T>,
  options?: {
    delay?: number
    fallback?: React.ComponentType
    error?: React.ComponentType
  }
) {
  let componentPromise: Promise<T> | null = null

  return async (): Promise<T> => {
    if (componentPromise) {
      return componentPromise
    }

    const { delay = 0 } = options || {}

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    componentPromise = loader().catch(error => {
      console.error('Component lazy loading failed:', error)
      throw error
    })

    return componentPromise
  }
}

// 虚拟滚动优化
export class VirtualScroller {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private scrollTop = 0
  private items: any[] = []

  constructor(container: HTMLElement, itemHeight: number) {
    this.container = container
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2
    this.setupScrollListener()
  }

  private setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop
      this.renderVisibleItems()
    }, { passive: true })
  }

  setItems(items: any[]) {
    this.items = items
    this.renderVisibleItems()
  }

  private renderVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length)

    // 触发渲染事件
    this.container.dispatchEvent(new CustomEvent('virtual-scroll', {
      detail: { startIndex, endIndex, visibleItems: this.items.slice(startIndex, endIndex) }
    }))
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 批量DOM更新
export class BatchDOMUpdates {
  private pendingUpdates = new Set<() => void>()
  private isScheduled = false

  schedule(update: () => void) {
    this.pendingUpdates.add(update)

    if (!this.isScheduled) {
      this.isScheduled = true
      requestAnimationFrame(() => {
        this.flush()
      })
    }
  }

  private flush() {
    this.pendingUpdates.forEach(update => update())
    this.pendingUpdates.clear()
    this.isScheduled = false
  }
}

// 性能监控工具
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  startMeasure(name: string) {
    performance.mark(`${name}-start`)
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    const measure = performance.getEntriesByName(name, 'measure').pop()
    if (measure) {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }
      this.metrics.get(name)!.push(measure.duration)
    }
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name) || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getMetrics() {
    const result: Record<string, { avg: number; count: number }> = {}
    this.metrics.forEach((times, name) => {
      result[name] = {
        avg: this.getAverageTime(name),
        count: times.length
      }
    })
    return result
  }
}

// 内存泄漏防护
export class MemoryLeakGuard {
  private observers = new Set<IntersectionObserver | MutationObserver>()
  private timers = new Set<NodeJS.Timeout>()
  private eventListeners = new Map<EventTarget, Map<string, EventListener[]>>()

  addObserver(observer: IntersectionObserver | MutationObserver) {
    this.observers.add(observer)
    return observer
  }

  addTimer(timer: NodeJS.Timeout) {
    this.timers.add(timer)
    return timer
  }

  addEventListener(target: EventTarget, event: string, listener: EventListener) {
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map())
    }

    const listeners = this.eventListeners.get(target)!
    if (!listeners.has(event)) {
      listeners.set(event, [])
    }

    listeners.get(event)!.push(listener)
    target.addEventListener(event, listener)
  }

  cleanup() {
    // 清理观察器
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()

    // 清理定时器
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // 清理事件监听器
    this.eventListeners.forEach((events, target) => {
      events.forEach((listeners, event) => {
        listeners.forEach(listener => {
          target.removeEventListener(event, listener)
        })
      })
    })
    this.eventListeners.clear()
  }
}

export default {
  ImageLazyLoader,
  lazyLoadComponent,
  VirtualScroller,
  debounce,
  throttle,
  BatchDOMUpdates,
  PerformanceMonitor,
  MemoryLeakGuard
}