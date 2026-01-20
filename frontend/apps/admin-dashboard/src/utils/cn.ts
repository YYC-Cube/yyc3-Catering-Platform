/**
 * @fileoverview YYC³餐饮行业智能化平台 - 工具函数
 * @description 通用工具函数
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function isEmpty(value: any): boolean {
  if (value == null) {
    return true
  }
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export function merge<T extends Record<string, any>>(...objs: Partial<T>[]): T {
  return Object.assign({}, ...objs) as T
}

export function get<T>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null) {
      return defaultValue as T
    }
    result = result[key]
  }

  return result ?? (defaultValue as T)
}

export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let target = obj

  for (const key of keys) {
    if (!(key in target)) {
      target[key] = {}
    }
    target = target[key]
  }

  target[lastKey] = value
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, c => c.toLowerCase())
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export function truncate(str: string, length = 50, suffix = '...'): string {
  if (str.length <= length) {
    return str
  }
  return str.substring(0, length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export function flatten<T>(array: T[][]): T[] {
  return array.flat()
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  return a.map((item, index) => [item, b[index]])
}

export function unzip<T, U>(array: [T, U][]): [T[], U[]] {
  return [
    array.map(item => item[0]),
    array.map(item => item[1]),
  ]
}

export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

export function sum(array: number[]): number {
  return array.reduce((acc, num) => acc + num, 0)
}

export function average(array: number[]): number {
  return sum(array) / array.length
}

export function min(array: number[]): number {
  return Math.min(...array)
}

export function max(array: number[]): number {
  return Math.max(...array)
}

export function median(array: number[]): number {
  const sorted = [...array].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function mode(array: number[]): number {
  const frequency: Record<number, number> = {}
  let maxFreq = 0
  let mode = array[0]

  for (const num of array) {
    frequency[num] = (frequency[num] || 0) + 1
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num]
      mode = num
    }
  }

  return mode
}

export function standardDeviation(array: number[]): number {
  const avg = average(array)
  const squareDiffs = array.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = average(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

export function percentage(value: number, total: number, decimals = 2): number {
  if (total === 0) {
    return 0
  }
  return Number(((value / total) * 100).toFixed(decimals))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
}

export function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t * t
}

export function downloadFile(content: string, filename: string, type = 'text/plain'): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(data: any, filename: string): void {
  const content = JSON.stringify(data, null, 2)
  downloadFile(content, filename, 'application/json')
}

export function downloadCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    return
  }

  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(header => row[header]))
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  downloadFile(csvContent, filename, 'text/csv')
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)

  return Promise.resolve()
}

export function parseQuery(query: string): Record<string, string> {
  const params = new URLSearchParams(query)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

export function stringifyQuery(params: Record<string, any>): string {
  return new URLSearchParams(params).toString()
}

export function getQueryParams(): Record<string, string> {
  return parseQuery(window.location.search)
}

export function setQueryParam(key: string, value: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set(key, value)
  window.history.replaceState({}, '', url.toString())
}

export function removeQueryParam(key: string): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  window.history.replaceState({}, '', url.toString())
}

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isTablet(): boolean {
  return /iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth >= 768
}

export function isDesktop(): boolean {
  return !isMobile() && !isTablet()
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  }
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function scrollToElement(element: HTMLElement, offset = 0): void {
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className)
}

export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className)
}

export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className)
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

export function getBoundingClientRect(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect()
}

export function getOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  }
}

export function createElement<T extends HTMLElement>(
  tag: string,
  attributes: Record<string, any> = {},
  children: (HTMLElement | string)[] = []
): T {
  const element = document.createElement(tag) as T

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase()
      element.addEventListener(eventName, value)
    } else {
      element.setAttribute(key, value)
    }
  })

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })

  return element
}

export function removeElement(element: HTMLElement): void {
  element.remove()
}

export function emptyElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

export function insertAfter(newNode: HTMLElement, referenceNode: HTMLElement): void {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling)
}

export function insertBefore(newNode: HTMLElement, referenceNode: HTMLElement): void {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode)
}

export function replaceElement(newNode: HTMLElement, oldNode: HTMLElement): void {
  oldNode.parentNode?.replaceChild(newNode, oldNode)
}

export function getComputedStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

export function setStyle(element: HTMLElement, styles: Record<string, string>): void {
  Object.assign(element.style, styles)
}

export function getStyle(element: HTMLElement, property: string): string {
  return element.style.getPropertyValue(property)
}

export function addEventListener<K extends keyof WindowEventMap>(
  element: Window | HTMLElement,
  event: K,
  handler: (event: WindowEventMap[K]) => void
): () => void {
  element.addEventListener(event, handler as EventListener)
  return () => element.removeEventListener(event, handler as EventListener)
}

export function removeEventListener<K extends keyof WindowEventMap>(
  element: Window | HTMLElement,
  event: K,
  handler: (event: WindowEventMap[K]) => void
): void {
  element.removeEventListener(event, handler as EventListener)
}

export function dispatchEvent(element: HTMLElement, event: string, detail?: any): void {
  const customEvent = new CustomEvent(event, { detail })
  element.dispatchEvent(customEvent)
}

export function preventDefault(event: Event): void {
  event.preventDefault()
}

export function stopPropagation(event: Event): void {
  event.stopPropagation()
}

export function stopImmediatePropagation(event: Event): void {
  event.stopImmediatePropagation()
}

export function getTarget(event: Event): EventTarget | null {
  return event.target
}

export function getCurrentTarget(event: Event): EventTarget | null {
  return event.currentTarget
}

export function isEventTarget(element: any): element is EventTarget {
  return element && typeof element.addEventListener === 'function'
}

export function getLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('Failed to get localStorage:', error)
    return null
  }
}

export function setLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error('Failed to set localStorage:', error)
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove localStorage:', error)
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

export function getSessionStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch (error) {
    console.error('Failed to getSessionStorage:', error)
    return null
  }
}

export function setSessionStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch (error) {
    console.error('Failed to setSessionStorage:', error)
  }
}

export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to removeSessionStorage:', error)
  }
}

export function clearSessionStorage(): void {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('Failed to clearSessionStorage:', error)
  }
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

export function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {}
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = value
    }
  })
  return cookies
}

export function clearAllCookies(): void {
  const cookies = getAllCookies()
  Object.keys(cookies).forEach(name => removeCookie(name))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function maskEmail(email: string, maskChar = '*'): string {
  const [username, domain] = email.split('@')
  if (!username || !domain) {
    return email
  }
  const maskedUsername = username.substring(0, 2) + maskChar.repeat(username.length - 2)
  return `${maskedUsername}@${domain}`
}

export function maskPhone(phone: string, maskChar = '*'): string {
  if (phone.length !== 11) {
    return phone
  }
  return `${phone.substring(0, 3)}${maskChar.repeat(4)}${phone.substring(7)}`
}

export function maskCard(card: string, maskChar = '*'): string {
  if (card.length < 8) {
    return card
  }
  return `${card.substring(0, 4)}${maskChar.repeat(card.length - 8)}${card.substring(card.length - 4)}`
}

export function maskID(id: string, maskChar = '*'): string {
  if (id.length < 6) {
    return id
  }
  return `${id.substring(0, 2)}${maskChar.repeat(id.length - 4)}${id.substring(id.length - 2)}`
}

export function generatePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function generateToken(length = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return token
}

export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export function encodeBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}

export function decodeBase64(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export function encodeJSON(data: any): string {
  return encodeBase64(JSON.stringify(data))
}

export function decodeJSON<T>(str: string): T | null {
  try {
    return JSON.parse(decodeBase64(str))
  } catch {
    return null
  }
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`
  } else if (days < 365) {
    return `${Math.floor(days / 30)}个月前`
  } else {
    return `${Math.floor(days / 365)}年前`
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatBits(bits: number, decimals = 2): string {
  if (bits === 0) {
    return '0 bps'
  }

  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bps', 'kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps']
  const i = Math.floor(Math.log(bits) / Math.log(k))

  return `${parseFloat((bits / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function formatRatio(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}:1`
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatRoman(num: number): string {
  if (num < 1 || num > 3999) {
    return String(num)
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  let result = ''

  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i]
      num -= values[i]
    }
  }

  return result
}

export function parseRoman(roman: string): number {
  const romanNumerals: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let result = 0
  let prev = 0

  for (let i = roman.length - 1; i >= 0; i--) {
    const current = romanNumerals[roman[i]]
    if (current < prev) {
      result -= current
    } else {
      result += current
    }
    prev = current
  }

  return result
}

export function formatChineseNumber(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿']

  if (num === 0) {
    return digits[0]
  }

  let result = ''
  let str = String(num)
  let zeroFlag = false

  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i])
    const unit = units[str.length - i - 1]

    if (digit === 0) {
      zeroFlag = true
    } else {
      if (zeroFlag) {
        result += digits[0]
        zeroFlag = false
      }
      result += digits[digit] + unit
    }
  }

  return result
}

export function parseChineseNumber(str: string): number {
  const digits: Record<string, number> = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  }
  const units: Record<string, number> = {
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
    亿: 100000000,
  }

  let result = 0
  let temp = 0
  let unitValue = 1

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i]

    if (digits[char] !== undefined) {
      temp += digits[char] * unitValue
      unitValue = 1
    } else if (units[char] !== undefined) {
      const value = units[char]
      if (value >= 10000) {
        result += temp * value
        temp = 0
        unitValue = 1
      } else {
        unitValue = value
      }
    }
  }

  return result + temp
}
