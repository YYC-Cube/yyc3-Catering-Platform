/**
 * YYC³餐饮行业智能化平台 - 安全防护工具
 */

// XSS防护
export class XSSProtection {
  // 危险的HTML标签和属性
  private static readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
    'select', 'button', 'link', 'meta', 'style', 'base', 'head'
  ]

  private static readonly DANGEROUS_ATTRIBUTES = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
    'javascript:', 'data:text/html', 'vbscript:', 'mocha:'
  ]

  // HTML清理
  static sanitizeHTML(html: string): string {
    if (!html) return ''

    // 移除危险标签
    let cleaned = html
    this.DANGEROUS_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
      cleaned = cleaned.replace(regex, '')
    })

    // 移除自闭合标签
    this.DANGEROUS_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*\/?>`, 'gis')
      cleaned = cleaned.replace(regex, '')
    })

    // 移除危险属性
    this.DANGEROUS_ATTRIBUTES.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gis')
      cleaned = cleaned.replace(regex, '')
    })

    // 移除JavaScript协议
    cleaned = cleaned.replace(/javascript:/gi, '')
    cleaned = cleaned.replace(/vbscript:/gi, '')
    cleaned = cleaned.replace(/data:(?!image\/)/gi, '')

    return cleaned
  }

  // 转义HTML特殊字符
  static escapeHTML(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // 安全的innerHTML设置
  static safeSetInnerHTML(element: HTMLElement, html: string): void {
    element.innerHTML = this.sanitizeHTML(html)
  }

  // 检查是否包含恶意代码
  static containsMaliciousCode(content: string): boolean {
    const maliciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i
    ]

    return maliciousPatterns.some(pattern => pattern.test(content))
  }
}

// CSRF防护
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token'
  private static readonly HEADER_NAME = 'X-CSRF-Token'

  // 生成CSRF令牌
  static generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // 获取CSRF令牌
  static getToken(): string {
    let token = sessionStorage.getItem(this.TOKEN_KEY)
    if (!token) {
      token = this.generateToken()
      sessionStorage.setItem(this.TOKEN_KEY, token)
    }
    return token
  }

  // 刷新CSRF令牌
  static refreshToken(): string {
    const token = this.generateToken()
    sessionStorage.setItem(this.TOKEN_KEY, token)
    return token
  }

  // 验证CSRF令牌
  static validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY)
    return storedToken === token && storedToken !== null
  }

  // 为请求添加CSRF令牌
  static addTokenToRequest(request: RequestInit): RequestInit {
    const token = this.getToken()
    return {
      ...request,
      headers: {
        ...request.headers,
        [this.HEADER_NAME]: token
      }
    }
  }

  // 从表单获取CSRF令牌
  static getTokenFromForm(form: HTMLFormElement): string | null {
    const input = form.querySelector(`input[name="${this.TOKEN_KEY}"]`) as HTMLInputElement
    return input?.value || null
  }

  // 为表单添加CSRF令牌
  static addTokenToForm(form: HTMLFormElement): void {
    if (!form.querySelector(`input[name="${this.TOKEN_KEY}"]`)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = this.TOKEN_KEY
      input.value = this.getToken()
      form.appendChild(input)
    }
  }
}

// 内容安全策略（CSP）
export class CSPHelper {
  // 检查CSP支持
  static isSupported(): boolean {
    return 'securityPolicy' in document || 'CSP' in window
  }

  // 获取当前CSP策略
  static getCurrentPolicy(): string | null {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    return meta?.getAttribute('content') || null
  }

  // 设置CSP元标签
  static setMetaTag(policy: string): void {
    // 移除现有的CSP元标签
    const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (existing) {
      existing.remove()
    }

    // 添加新的CSP元标签
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = policy
    document.head.appendChild(meta)
  }

  // 生成默认CSP策略
  static generateDefaultPolicy(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
}

// 输入验证
export class InputValidator {
  // 验证邮箱
  static isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email) && email.length <= 254
  }

  // 验证手机号（中国）
  static isValidPhone(phone: string): boolean {
    const regex = /^1[3-9]\d{9}$/
    return regex.test(phone)
  }

  // 验证密码强度
  static validatePassword(password: string): PasswordStrength {
    const strength: PasswordStrength = {
      score: 0,
      level: 'weak',
      suggestions: []
    }

    // 长度检查
    if (password.length >= 8) {
      strength.score += 1
    } else {
      strength.suggestions.push('密码长度至少8位')
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      strength.score += 1
    } else {
      strength.suggestions.push('包含小写字母')
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      strength.score += 1
    } else {
      strength.suggestions.push('包含大写字母')
    }

    // 包含数字
    if (/\d/.test(password)) {
      strength.score += 1
    } else {
      strength.suggestions.push('包含数字')
    }

    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength.score += 1
    } else {
      strength.suggestions.push('包含特殊字符')
    }

    // 评分等级
    if (strength.score <= 2) {
      strength.level = 'weak'
    } else if (strength.score <= 4) {
      strength.level = 'medium'
    } else {
      strength.level = 'strong'
    }

    return strength
  }

  // 验证URL
  static isValidURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 清理输入
  static sanitizeInput(input: string, maxLength = 1000): string {
    return XSSProtection.escapeHTML(input.substring(0, maxLength))
  }

  // 验证数字范围
  static isNumberInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max
  }

  // 验证日期
  static isValidDate(date: string): boolean {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
  }
}

// 安全的HTTP请求
export class SecureHTTPClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  }

  // 安全的GET请求
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'GET'
    })
  }

  // 安全的POST请求
  async post(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // 安全的PUT请求
  async put(url: string, data: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // 安全的DELETE请求
  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'DELETE'
    })
  }

  // 通用请求方法
  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    const fullUrl = `${this.baseURL}${url}`

    // 添加安全头
    const secureOptions = CSRFProtection.addTokenToRequest({
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    try {
      const response = await fetch(fullUrl, secureOptions)

      // 检查响应安全
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        // 对于HTML响应，检查XSS
        const text = await response.text()
        if (XSSProtection.containsMaliciousCode(text)) {
          throw new Error('Response contains potentially malicious code')
        }
        return new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        })
      }

      return response
    } catch (error) {
      console.error('Secure HTTP request failed:', error)
      throw error
    }
  }
}

// 会话管理
export class SessionManager {
  private static readonly SESSION_KEY = 'yyc3_session'
  private static readonly TIMEOUT_KEY = 'yyc3_session_timeout'

  // 设置会话
  static setSession(sessionData: any, timeoutMinutes = 30): void {
    const session = {
      data: sessionData,
      createdAt: Date.now(),
      timeout: timeoutMinutes * 60 * 1000
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(this.TIMEOUT_KEY, Date.now().toString())
  }

  // 获取会话
  static getSession(): any | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY)
    if (!sessionStr) return null

    try {
      const session = JSON.parse(sessionStr)

      // 检查会话是否过期
      if (Date.now() - session.createdAt > session.timeout) {
        this.clearSession()
        return null
      }

      return session.data
    } catch {
      this.clearSession()
      return null
    }
  }

  // 清除会话
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem(this.TIMEOUT_KEY)
    sessionStorage.clear()
  }

  // 检查会话是否有效
  static isSessionValid(): boolean {
    return this.getSession() !== null
  }

  // 刷新会话超时
  static refreshSession(): void {
    const timeout = localStorage.getItem(this.TIMEOUT_KEY)
    if (timeout) {
      localStorage.setItem(this.TIMEOUT_KEY, Date.now().toString())
    }
  }

  // 检查会话是否即将过期
  static isSessionExpiringSoon(thresholdMinutes = 5): boolean {
    const sessionStr = localStorage.getItem(this.SESSION_KEY)
    if (!sessionStr) return false

    try {
      const session = JSON.parse(sessionStr)
      const timeRemaining = session.timeout - (Date.now() - session.createdAt)
      return timeRemaining < thresholdMinutes * 60 * 1000
    } catch {
      return true
    }
  }
}

// 权限管理
export class PermissionManager {
  private static readonly PERMISSIONS_KEY = 'yyc3_permissions'

  // 设置权限
  static setPermissions(permissions: string[]): void {
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions))
  }

  // 获取权限
  static getPermissions(): string[] {
    const permissionsStr = localStorage.getItem(this.PERMISSIONS_KEY)
    if (!permissionsStr) return []

    try {
      return JSON.parse(permissionsStr)
    } catch {
      return []
    }
  }

  // 检查是否有特定权限
  static hasPermission(permission: string): boolean {
    const permissions = this.getPermissions()
    return permissions.includes(permission) || permissions.includes('*')
  }

  // 检查是否有任一权限
  static hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // 检查是否有所有权限
  static hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // 清除权限
  static clearPermissions(): void {
    localStorage.removeItem(this.PERMISSIONS_KEY)
  }
}

// 审计日志
export class AuditLogger {
  private static readonly AUDIT_KEY = 'yyc3_audit_logs'
  private static readonly MAX_LOGS = 1000

  // 记录审计日志
  static log(event: AuditEvent): void {
    const logs = this.getLogs()
    const auditLog: AuditLog = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    logs.push(auditLog)

    // 限制日志数量
    if (logs.length > this.MAX_LOGS) {
      logs.splice(0, logs.length - this.MAX_LOGS)
    }

    localStorage.setItem(this.AUDIT_KEY, JSON.stringify(logs))

    // 异步发送到服务器（如果需要）
    this.sendToServer(auditLog)
  }

  // 获取日志
  static getLogs(filter?: AuditFilter): AuditLog[] {
    const logsStr = localStorage.getItem(this.AUDIT_KEY)
    if (!logsStr) return []

    try {
      let logs = JSON.parse(logsStr)

      if (filter) {
        logs = logs.filter((log: AuditLog) => {
          if (filter.action && log.action !== filter.action) return false
          if (filter.resource && log.resource !== filter.resource) return false
          if (filter.userId && log.userId !== filter.userId) return false
          if (filter.startTime && log.timestamp < filter.startTime) return false
          if (filter.endTime && log.timestamp > filter.endTime) return false
          return true
        })
      }

      return logs
    } catch {
      return []
    }
  }

  // 清除日志
  static clearLogs(): void {
    localStorage.removeItem(this.AUDIT_KEY)
  }

  // 生成ID
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 发送到服务器
  private static async sendToServer(log: AuditLog): Promise<void> {
    try {
      // 这里可以添加发送到服务器的逻辑
      await fetch('/api/v1/audit/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      })
    } catch (error) {
      console.warn('Failed to send audit log to server:', error)
    }
  }
}

// 接口定义
interface PasswordStrength {
  score: number
  level: 'weak' | 'medium' | 'strong'
  suggestions: string[]
}

interface AuditEvent {
  action: string
  resource: string
  userId?: string
  details?: Record<string, any>
}

interface AuditLog extends AuditEvent {
  id: string
  timestamp: number
  userAgent: string
  url: string
}

interface AuditFilter {
  action?: string
  resource?: string
  userId?: string
  startTime?: number
  endTime?: number
}

// 初始化安全设置
export function initSecurity(): void {
  // 设置CSP策略
  if (!CSPHelper.getCurrentPolicy()) {
    CSPHelper.setMetaTag(CSPHelper.generateDefaultPolicy())
  }

  // 生成CSRF令牌
  CSRFProtection.getToken()

  // 监听会话超时
  setInterval(() => {
    if (SessionManager.isSessionExpiringSoon()) {
      console.warn('Session is expiring soon')
      // 可以在这里显示警告消息
    }
  }, 60000) // 每分钟检查一次

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 页面变为可见时检查会话
      if (!SessionManager.isSessionValid()) {
        console.warn('Session expired, redirecting to login')
        window.location.href = '/login'
      }
    }
  })
}