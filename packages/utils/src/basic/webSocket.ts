/**
 * 实现了所有核心功能：
 * - WebSocket 连接管理
 * - 自动重连机制
 * - 心跳检测
 * - 消息队列
 * - 事件处理系统
 *
 * 添加了所有必要的方法：
 * - connect 建立连接
 * - send/ sendBinary 发送消息
 * - close/ destroy 关闭和清理资源
 * - 事件监听器管理方法
 * - 心跳和重连相关方法
 *
 * 处理了各种边缘情况：
 * - 连接超时
 * - 连接失败
 * - 意外断开
 * - 错误处理
 * - 资源清理
 *
 * 提供了良好的类型安全和错误处理：
 * 完整的 TypeScript 类型定义
 * 全面的错误捕获和日志记录
 *
 */

/**
 * WebSocket连接状态枚举
 */
export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
  RECONNECTING = 'RECONNECTING',
}

/**
 * 标准WebSocket事件名称
 */
export type StandardEventName = 'open' | 'message' | 'error' | 'close' | 'heartbeat_timeout'

/**
 * 标准WebSocket事件处理函数类型
 */
export type StandardEventHandler = (event: Event | MessageEvent | CloseEvent) => void

/**
 * 自定义事件处理函数类型
 */
export type CustomEventHandler<T = any> = (data: T, originalEvent?: MessageEvent) => void

/**
 * 状态变化处理函数类型
 */
export type StateChangeHandler = (
  newState: ConnectionState,
  previousState: ConnectionState,
  event?: Event,
) => void

/**
 * WebSocket配置选项
 */
export interface WebSocketOptions {
  /** WebSocket连接URL */
  url: string
  /** 心跳间隔(毫秒) */
  heartbeatInterval?: number
  /** 重连间隔(毫秒) */
  reconnectInterval?: number
  /** 最大重连次数 */
  reconnectAttempts?: number
  /** 心跳消息生成函数 */
  heartbeatMessage?: () => string | object
  /** 消息类型字段名 */
  typeField?: string
  /** 是否自动重连 */
  autoReconnect?: boolean
  /** 是否启用心跳 */
  enableHeartbeat?: boolean
  /** 连接后是否立即发送心跳 */
  heartbeatOnConnect?: boolean
  /** 是否自动解析消息 */
  autoParseMessage?: boolean
  /** 调试模式 */
  debug?: boolean
  /** 连接超时(毫秒) */
  connectionTimeout?: number
  /** WebSocket类(用于测试) */
  webSocketClass?: typeof WebSocket
  /** 初始事件处理器 */
  handlers?: WebSocketEventHandlers
  /** 二进制消息类型 */
  binaryType?: BinaryType
  /** 最大消息队列长度 */
  maxQueueSize?: number
  /** 是否在窗口聚焦时自动重连 */
  reconnectOnFocus?: boolean
  /** 是否在网络恢复时自动重连 */
  reconnectOnOnline?: boolean
  /** 心跳超时时间(毫秒) */
  heartbeatTimeout?: number
}

/**
 * WebSocket事件处理器配置
 */
export interface WebSocketEventHandlers {
  /** 标准事件处理器 */
  standard?: {
    [K in StandardEventName]?: StandardEventHandler | StandardEventHandler[];
  }
  /** 自定义消息事件处理器 */
  message?: {
    [key: string]: CustomEventHandler | CustomEventHandler[]
  }
  /** 状态变化事件处理器 */
  stateChange?: StateChangeHandler | StateChangeHandler[]
  /** 重连尝试事件处理器 */
  reconnect?: ((attempt: number, max: number) => void) | ((attempt: number, max: number) => void)[]
}

/**
 * 增强型WebSocket客户端
 * 支持自动重连、心跳检测、消息队列和自定义事件
 */
export class WebSocketClient {
  private url: string
  private websocket: WebSocket | null = null
  private heartbeatInterval: number
  private reconnectInterval: number
  private reconnectAttempts: number
  private heartbeatMessage: () => string | object
  private typeField: string
  private autoReconnect: boolean
  private enableHeartbeat: boolean
  private heartbeatOnConnect: boolean
  private autoParseMessage: boolean
  private debug: boolean
  private connectionTimeout: number
  private WebSocketClass: typeof WebSocket
  private binaryType: BinaryType
  private maxQueueSize: number
  private reconnectOnFocus: boolean
  private reconnectOnOnline: boolean
  private heartbeatTimeout: number

  private currentState: ConnectionState = ConnectionState.CLOSED
  private reconnectCount: number = 0
  private heartbeatTimer: number | null = null
  private heartbeatTimeoutTimer: number | null = null
  private reconnectTimer: number | null = null
  private connectionTimeoutTimer: number | null = null
  private messageQueue: (string | object)[] = []
  private lastMessageTime: number = 0
  private lastHeartbeatTime: number = 0
  private focusListener: (() => void) | null = null
  private onlineListener: (() => void) | null = null

  // 标准WebSocket事件处理器
  private standardEventHandlers: Record<StandardEventName, StandardEventHandler[]> = {
    open: [],
    message: [],
    error: [],
    close: [],
    heartbeat_timeout: [],
  }

  // 自定义消息事件处理器
  private customEventHandlers: Map<string | number, CustomEventHandler[]> = new Map()

  // 状态变化事件处理器
  private stateChangeHandlers: StateChangeHandler[] = []

  // 重连尝试事件处理器
  private reconnectHandlers: ((attempt: number, max: number) => void)[] = []

  /**
   * 创建WebSocket客户端
   * @param options - 配置选项
   */
  constructor(options: WebSocketOptions) {
    this.url = options.url
    this.heartbeatInterval = options.heartbeatInterval || 30000
    this.reconnectInterval = options.reconnectInterval || 3000
    this.reconnectAttempts = options.reconnectAttempts || 5
    this.heartbeatMessage = options.heartbeatMessage || (() => JSON.stringify({ type: 'ping' }))
    this.typeField = options.typeField || 'type'
    this.autoReconnect = options.autoReconnect !== false
    this.enableHeartbeat = options.enableHeartbeat !== false
    this.heartbeatOnConnect = options.heartbeatOnConnect || false
    this.autoParseMessage = options.autoParseMessage !== false
    this.debug = options.debug || false
    this.connectionTimeout = options.connectionTimeout || 10000
    this.WebSocketClass = options.webSocketClass || WebSocket
    this.binaryType = options.binaryType || 'blob'
    this.maxQueueSize = options.maxQueueSize || 100
    this.reconnectOnFocus = options.reconnectOnFocus !== false
    this.reconnectOnOnline = options.reconnectOnOnline !== false
    this.heartbeatTimeout = options.heartbeatTimeout || 5000

    // 注册初始事件处理器
    if (options.handlers) {
      this.registerHandlers(options.handlers)
    }

    // 设置窗口焦点和网络事件监听器
    this.setupWindowListeners()
  }

  /**
   * 设置窗口焦点和网络事件监听器
   */
  private setupWindowListeners(): void {
    if (typeof window !== 'undefined') {
      // 窗口获得焦点时重连
      if (this.reconnectOnFocus) {
        this.focusListener = () => {
          if (this.currentState === ConnectionState.CLOSED && this.autoReconnect) {
            this.log('Window focused, attempting to reconnect')
            this.reconnect()
          }
        }
        window.addEventListener('focus', this.focusListener)
      }

      // 网络恢复时重连
      if (this.reconnectOnOnline) {
        this.onlineListener = () => {
          if (this.currentState === ConnectionState.CLOSED && this.autoReconnect) {
            this.log('Network online, attempting to reconnect')
            this.reconnect()
          }
        }
        window.addEventListener('online', this.onlineListener)
      }
    }
  }

  /**
   * 移除窗口事件监听器
   */
  private removeWindowListeners(): void {
    if (typeof window !== 'undefined') {
      if (this.focusListener) {
        window.removeEventListener('focus', this.focusListener)
        this.focusListener = null
      }

      if (this.onlineListener) {
        window.removeEventListener('online', this.onlineListener)
        this.onlineListener = null
      }
    }
  }

  /**
   * 注册多个事件处理器
   * @param handlers - 事件处理器配置
   */
  public registerHandlers(handlers: WebSocketEventHandlers): this {
    // 注册标准事件处理器
    if (handlers.standard) {
      Object.entries(handlers.standard).forEach(([event, handler]) => {
        const eventName = event as StandardEventName
        if (Array.isArray(handler)) {
          handler.forEach(h => this.on(eventName, h))
        }
        else if (handler) {
          this.on(eventName, handler)
        }
      })
    }

    // 注册自定义消息事件处理器
    if (handlers.message) {
      Object.entries(handlers.message).forEach(([type, handler]) => {
        if (Array.isArray(handler)) {
          handler.forEach(h => this.onMessage(type, h))
        }
        else if (handler) {
          this.onMessage(type, handler)
        }
      })
    }

    // 注册状态变化事件处理器
    if (handlers.stateChange) {
      if (Array.isArray(handlers.stateChange)) {
        handlers.stateChange.forEach(handler => this.onStateChange(handler))
      }
      else {
        this.onStateChange(handlers.stateChange)
      }
    }

    // 注册重连尝试事件处理器
    if (handlers.reconnect) {
      if (Array.isArray(handlers.reconnect)) {
        handlers.reconnect.forEach(handler => this.onReconnect(handler))
      }
      else {
        this.onReconnect(handlers.reconnect)
      }
    }

    return this
  }

  /**
   * 建立WebSocket连接
   * @returns 连接成功的Promise
   */
  public connect(): Promise<Event> {
    // 如果已经连接或正在连接，则返回
    if (this.websocket
      && (this.websocket.readyState === WebSocket.CONNECTING
        || this.websocket.readyState === WebSocket.OPEN)) {
      return Promise.reject(new Error('WebSocket is already connecting or connected'))
    }

    // 清理之前的连接
    if (this.websocket) {
      try {
        this.websocket.close()
      }
      catch (error) {
        this.log('Error closing previous WebSocket', error)
        // 忽略关闭错误
      }
    }

    // 设置连接状态
    this.setConnectionState(ConnectionState.CONNECTING)

    return new Promise((resolve, reject) => {
      try {
        // 创建新的WebSocket实例
        this.websocket = new this.WebSocketClass(this.url)
        this.websocket.binaryType = this.binaryType

        // 设置连接超时
        this.clearConnectionTimeout()
        this.connectionTimeoutTimer = window.setTimeout(() => {
          if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
            const error = new Error(`Connection timeout after ${this.connectionTimeout}ms`)
            this.log('Connection timeout', error)
            this.websocket.close()
            reject(error)
          }
        }, this.connectionTimeout)

        // 监听连接打开事件
        this.websocket.onopen = (event: Event) => {
          this.clearConnectionTimeout()
          this.reconnectCount = 0
          this.setConnectionState(ConnectionState.OPEN, event)

          // 调用所有open事件处理器
          this.standardEventHandlers.open.forEach((handler) => {
            try {
              handler(event)
            }
            catch (error) {
              this.log('Error in open handler', error)
            }
          })

          // 启动心跳
          this.startHeartbeat()

          // 如果配置了连接后立即发送心跳
          if (this.heartbeatOnConnect && this.enableHeartbeat) {
            this.sendHeartbeat()
          }

          // 处理消息队列
          this.processMessageQueue()

          resolve(event)
        }

        // 监听消息事件
        this.websocket.onmessage = (event: MessageEvent) => {
          this.handleMessage(event)
        }

        // 监听错误事件
        this.websocket.onerror = (event: Event) => {
          this.log('WebSocket error', event)

          // 调用所有error事件处理器
          this.standardEventHandlers.error.forEach((handler) => {
            try {
              handler(event)
            }
            catch (error) {
              this.log('Error in error handler', error)
            }
          })

          // 如果还在连接中，则拒绝Promise
          if (this.currentState === ConnectionState.CONNECTING) {
            this.clearConnectionTimeout()
            reject(new Error('WebSocket connection failed'))
          }
        }

        // 监听关闭事件
        this.websocket.onclose = (event: CloseEvent) => {
          this.clearConnectionTimeout()
          this.stopHeartbeat()

          const wasConnecting = this.currentState === ConnectionState.CONNECTING
          this.setConnectionState(ConnectionState.CLOSED, event)

          // 调用所有close事件处理器
          this.standardEventHandlers.close.forEach((handler) => {
            try {
              handler(event)
            }
            catch (error) {
              this.log('Error in close handler', error)
            }
          })

          // 如果是非正常关闭且允许重连，则尝试重连
          if (this.autoReconnect && event.code !== 1000 && event.code !== 1001) {
            this.attemptReconnect()
          }

          // 如果还在连接中，则拒绝Promise
          if (wasConnecting) {
            reject(new Error(`WebSocket closed during connection: ${event.code} ${event.reason}`))
          }
        }
      }
      catch (error) {
        this.clearConnectionTimeout()
        this.setConnectionState(ConnectionState.CLOSED)
        this.log('Error creating WebSocket', error)
        reject(error)
      }
    })
  }

  /**
   * 处理接收到的消息
   * @param event - 消息事件
   */
  private handleMessage(event: MessageEvent): void {
    this.lastMessageTime = Date.now()

    // 调用所有标准消息处理器
    this.standardEventHandlers.message.forEach((handler) => {
      try {
        handler(event)
      }
      catch (error) {
        this.log('Error in message handler', error)
      }
    })

    // 只要收到消息，就认为心跳正常，清除超时计时器
    this.clearHeartbeatTimeout()

    // 如果不需要自动解析消息，则到此结束
    if (!this.autoParseMessage) {
      return
    }

    // 尝试解析消息为JSON
    try {
      let data: any

      if (typeof event.data === 'string') {
        data = JSON.parse(event.data)
      }
      else if (event.data instanceof ArrayBuffer
        || event.data instanceof Blob) {
        // 二进制数据不尝试解析为JSON
        return
      }
      else {
        data = event.data
      }

      // 获取消息类型
      const type = data[this.typeField]

      // 检查是否是心跳响应
      if (type === 'pong' || type === 'heartbeat_response') {
        this.log('Received heartbeat response')
      }

      if (type && this.customEventHandlers.has(type)) {
        // 调用对应类型的自定义消息处理器
        const handlers = this.customEventHandlers.get(type) || []
        handlers.forEach((handler) => {
          try {
            handler(data, event)
          }
          catch (error) {
            this.log(`Error in custom message handler for type "${type}"`, error)
          }
        })
      }
    }
    catch (error) {
      this.log('Error parsing message', error)
    }
  }

  /**
   * 发送消息
   * @param message - 要发送的消息
   * @param queue - 连接关闭时是否加入队列
   * @returns 是否发送成功
   */
  public send(message: string | object, queue: boolean = true): boolean {
    if (this.isOpen()) {
      try {
        const data = typeof message === 'string' ? message : JSON.stringify(message)
        this.websocket!.send(data)
        return true
      }
      catch (error) {
        this.log('Error sending message', error)
        return false
      }
    }
    else if (queue) {
      // 如果连接未打开且允许加入队列，则加入消息队列
      this.queueMessage(message)
      return false
    }
    return false
  }

  /**
   * 发送二进制数据
   * @param data - 二进制数据
   * @param queue - 连接关闭时是否加入队列
   * @returns 是否发送成功
   */
  public sendBinary(data: ArrayBuffer | Blob | ArrayBufferView, queue: boolean = true): boolean {
    if (this.isOpen()) {
      try {
        this.websocket!.send(data as Parameters<WebSocket['send']>[0])
        return true
      }
      catch (error) {
        this.log('Error sending binary data', error)
        return false
      }
    }
    else if (queue) {
      // 二进制数据也可以加入队列
      this.queueMessage(data)
      return false
    }
    return false
  }

  /**
   * 将消息加入队列
   * @param message - 要加入队列的消息
   */
  private queueMessage(message: any): void {
    // 检查队列是否已满
    if (this.messageQueue.length >= this.maxQueueSize) {
      // 移除最早的消息
      this.messageQueue.shift()
    }
    this.messageQueue.push(message)
  }

  /**
   * 处理消息队列
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length > 0 && this.isOpen()) {
      this.flushMessageQueue()
    }
  }

  /**
   * 发送队列中的所有消息
   */
  private flushMessageQueue(): void {
    if (!this.isOpen() || this.messageQueue.length === 0) {
      return
    }

    const queue = [...this.messageQueue]
    this.messageQueue = []

    queue.forEach((message) => {
      if (message instanceof ArrayBuffer
        || message instanceof Blob
        || message instanceof Uint8Array) {
        this.sendBinary(message, false)
      }
      else {
        this.send(message, false)
      }
    })
  }

  /**
   * 关闭WebSocket连接
   * @param code - 关闭代码
   * @param reason - 关闭原因
   */
  public close(code: number = 1000, reason: string = 'Normal closure'): void {
    this.autoReconnect = false

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.websocket && (this.websocket.readyState === WebSocket.CONNECTING
      || this.websocket.readyState === WebSocket.OPEN)) {
      try {
        this.websocket.close(code, reason)
      }
      catch (error) {
        this.log('Error closing WebSocket', error)
      }
    }
  }

  /**
   * 销毁WebSocket客户端实例
   * 关闭连接并清理所有资源
   */
  public destroy(): void {
    this.close(1000, 'Client destroyed')
    this.offAll()
    this.removeWindowListeners()
    this.clearMessageQueue()
    this.clearConnectionTimeout()
    this.clearHeartbeatTimeout()

    // 清理重连计时器
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.websocket = null
  }

  /**
   * 添加标准WebSocket事件监听器
   * @param event - 事件名称 (open|message|error|close)
   * @param handler - 事件处理函数
   */
  public on(event: StandardEventName, handler: StandardEventHandler): this {
    if (this.standardEventHandlers[event]) {
      this.standardEventHandlers[event].push(handler)
    }
    return this
  }

  /**
   * 添加自定义消息事件监听器
   * @param type - 消息类型
   * @param handler - 事件处理函数
   */
  public onMessage<T = any>(type: string | number, handler: CustomEventHandler<T>): this {
    if (!this.customEventHandlers.has(type)) {
      this.customEventHandlers.set(type, [])
    }

    const handlers = this.customEventHandlers.get(type) || []
    handlers.push(handler as CustomEventHandler)
    this.customEventHandlers.set(type, handlers)

    return this
  }

  /**
   * 添加状态变化事件监听器
   * @param handler - 状态变化处理函数
   */
  public onStateChange(handler: StateChangeHandler): this {
    this.stateChangeHandlers.push(handler)
    return this
  }

  /**
   * 添加重连尝试事件监听器
   * @param handler - 重连尝试处理函数
   */
  public onReconnect(handler: (attempt: number, max: number) => void): this {
    this.reconnectHandlers.push(handler)
    return this
  }

  /**
   * 移除标准WebSocket事件监听器
   * @param event - 事件名称
   * @param handler - 要移除的处理函数
   */
  public off(event: StandardEventName, handler?: StandardEventHandler): this {
    if (!this.standardEventHandlers[event]) {
      return this
    }

    if (handler) {
      // 移除特定处理函数
      this.standardEventHandlers[event] = this.standardEventHandlers[event].filter(h => h !== handler)
    }
    else {
      // 移除所有该类型的处理函数
      this.standardEventHandlers[event] = []
    }

    return this
  }

  /**
   * 移除自定义消息事件监听器
   * @param type - 消息类型
   * @param handler - 要移除的处理函数
   */
  public offMessage(type: string | number, handler?: CustomEventHandler): this {
    if (!this.customEventHandlers.has(type)) {
      return this
    }

    if (handler) {
      // 移除特定处理函数
      const handlers = this.customEventHandlers.get(type) || []
      this.customEventHandlers.set(type, handlers.filter(h => h !== handler))
    }
    else {
      // 移除所有该类型的处理函数
      this.customEventHandlers.delete(type)
    }

    return this
  }

  /**
   * 移除状态变化事件监听器
   * @param handler - 要移除的处理函数
   */
  public offStateChange(handler?: StateChangeHandler): this {
    if (handler) {
      this.stateChangeHandlers = this.stateChangeHandlers.filter(h => h !== handler)
    }
    else {
      this.stateChangeHandlers = []
    }

    return this
  }

  /**
   * 移除重连尝试事件监听器
   * @param handler - 要移除的处理函数
   */
  public offReconnect(handler?: (attempt: number, max: number) => void): this {
    if (handler) {
      this.reconnectHandlers = this.reconnectHandlers.filter(h => h !== handler)
    }
    else {
      this.reconnectHandlers = []
    }

    return this
  }

  /**
   * 移除所有事件监听器
   */
  public offAll(): this {
    // 清空标准事件处理器
    Object.keys(this.standardEventHandlers).forEach((event) => {
      this.standardEventHandlers[event as StandardEventName] = []
    })

    // 清空自定义消息事件处理器
    this.customEventHandlers.clear()

    // 清空状态变化事件处理器
    this.stateChangeHandlers = []

    // 清空重连尝试事件处理器
    this.reconnectHandlers = []

    return this
  }

  /**
   * 手动触发重连
   * @returns 重连Promise
   */
  public reconnect(): Promise<Event> {
    if (this.websocket) {
      this.websocket.close()
    }

    this.reconnectCount = 0
    this.autoReconnect = true
    return this.connect()
  }

  /**
   * 清除消息队列
   */
  public clearMessageQueue(): this {
    this.messageQueue = []
    return this
  }

  /**
   * 获取当前连接状态
   * @returns 连接状态
   */
  public getState(): ConnectionState {
    return this.currentState
  }

  /**
   * 检查连接是否打开
   * @returns 连接是否打开
   */
  public isOpen(): boolean {
    return this.currentState === ConnectionState.OPEN
      && this.websocket !== null
      && this.websocket.readyState === WebSocket.OPEN
  }

  /**
   * 获取上次接收消息的时间
   * @returns 时间戳
   */
  public getLastMessageTime(): number {
    return this.lastMessageTime
  }

  /**
   * 获取消息队列长度
   * @returns 队列长度
   */
  public getQueueLength(): number {
    return this.messageQueue.length
  }

  /**
   * 获取连接统计信息
   * @returns 连接统计信息
   */
  public getConnectionStats(): {
    state: ConnectionState
    reconnectCount: number
    lastMessageTime: number
    lastHeartbeatTime: number
    queueLength: number
    isOpen: boolean
  } {
    return {
      state: this.currentState,
      reconnectCount: this.reconnectCount,
      lastMessageTime: this.lastMessageTime,
      lastHeartbeatTime: this.lastHeartbeatTime,
      queueLength: this.messageQueue.length,
      isOpen: this.isOpen(),
    }
  }

  /**
   * 手动发送心跳
   */
  public sendHeartbeat(): boolean {
    const message = this.heartbeatMessage()
    const success = this.send(message, false)
    if (success) {
      this.lastHeartbeatTime = Date.now()
      this.startHeartbeatTimeout()
    }
    return success
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    if (this.enableHeartbeat) {
      this.heartbeatTimer = window.setInterval(() => {
        if (this.isOpen()) {
          this.sendHeartbeat()
        }
      }, this.heartbeatInterval)
    }
  }

  /**
   * 启动心跳超时检测
   */
  private startHeartbeatTimeout(): void {
    this.clearHeartbeatTimeout()

    this.heartbeatTimeoutTimer = window.setTimeout(() => {
      if (this.isOpen()) {
        this.log('Heartbeat response timeout')
        // 触发心跳超时事件
        this.standardEventHandlers.heartbeat_timeout.forEach((handler) => {
          try {
            handler(new CustomEvent('heartbeat_timeout'))
          }
          catch (error) {
            this.log('Error in heartbeat_timeout handler', error)
          }
        })
        this.websocket?.close(1000, 'Heartbeat response timeout')
      }
    }, this.heartbeatTimeout)
  }

  /**
   * 清除心跳超时计时器
   */
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer !== null) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatTimeout()
  }

  /**
   * 清除连接超时计时器
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer !== null) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (!this.autoReconnect || this.reconnectCount >= this.reconnectAttempts
      || this.currentState === ConnectionState.CONNECTING
      || this.currentState === ConnectionState.RECONNECTING) {
      return
    }

    this.reconnectCount++
    this.setConnectionState(ConnectionState.RECONNECTING)

    // 计算指数退避重连延迟，添加随机抖动避免雷群效应
    const baseDelay = this.reconnectInterval * 1.5 ** (this.reconnectCount - 1)
    const jitter = Math.random() * 1000 // 0-1秒的随机抖动
    const delay = Math.min(baseDelay + jitter, 30000) // 最大30秒

    // 触发重连尝试事件
    this.reconnectHandlers.forEach((handler) => {
      try {
        handler(this.reconnectCount, this.reconnectAttempts)
      }
      catch (error) {
        this.log('Error in reconnect handler', error)
      }
    })

    this.log(`Attempting to reconnect (${this.reconnectCount}/${this.reconnectAttempts}) in ${Math.round(delay)}ms...`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
        .then(() => {
          this.log('Reconnection successful')
          // 重连成功后发送队列中的消息
          this.flushMessageQueue()
        })
        .catch((error) => {
          this.log('Reconnection failed', error)
          // 如果还有重连次数，继续尝试
          if (this.reconnectCount < this.reconnectAttempts) {
            this.attemptReconnect()
          }
          else {
            this.log('Max reconnection attempts reached')
            this.setConnectionState(ConnectionState.CLOSED)
          }
        })
    }, delay)
  }

  /**
   * 设置连接状态并触发状态变化事件
   * @param state - 新状态
   * @param event - 相关事件
   */
  private setConnectionState(state: ConnectionState, event?: Event): void {
    if (this.currentState !== state) {
      const previousState = this.currentState
      this.currentState = state

      // 触发状态变化事件
      this.stateChangeHandlers.forEach((handler) => {
        try {
          handler(state, previousState, event)
        }
        catch (error) {
          this.log('Error in state change handler', error)
        }
      })
    }
  }

  /**
   * 记录调试日志
   * @param message - 日志消息
   * @param args - 附加参数
   */
  private log(message: string, ...args: any[]): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(`[WebSocket] ${message}`, ...args)
    }
  }

  /**
   * 创建单例WebSocket客户端
   * @param options - 配置选项
   * @returns WebSocket客户端实例
   */
  public static createInstance(options: WebSocketOptions): WebSocketClient {
    return new WebSocketClient(options)
  }

  /**
   * 检查浏览器是否支持WebSocket
   * @returns 是否支持WebSocket
   */
  public static isSupported(): boolean {
    return typeof WebSocket !== 'undefined'
  }

  /**
   * 创建一个简单的WebSocket连接
   * @param url - WebSocket URL
   * @param handlers - 事件处理器
   * @returns WebSocket客户端实例
   */
  public static async connect(url: string, handlers?: WebSocketEventHandlers): Promise<WebSocketClient> {
    const client = new WebSocketClient({ url, handlers })
    await client.connect()
    return client
  }
}

/**
 * 创建WebSocket客户端
 * @param options - 配置选项
 * @returns WebSocket客户端实例
 */
export function createWebSocket(options: WebSocketOptions): WebSocketClient {
  return new WebSocketClient(options)
}

/**
 * 检查浏览器是否支持WebSocket
 * @returns 是否支持WebSocket
 */
export function isWebSocketSupported(): boolean {
  return WebSocketClient.isSupported()
}

/**
 * 创建一个简单的WebSocket连接
 * @param url - WebSocket URL
 * @param handlers - 事件处理器
 * @returns WebSocket客户端实例
 */
export async function connectWebSocket(url: string, handlers?: WebSocketEventHandlers): Promise<WebSocketClient> {
  return await WebSocketClient.connect(url, handlers)
}

// 导出默认类
export default WebSocketClient
