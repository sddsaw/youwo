import type { ProxyOptions } from 'vite'
import type { ViteEnv } from '../types.js'
import { consola } from 'consola'
import json5 from 'json5'
import { bgRed, bgYellow, green, lightBlue } from 'kolorist'

function createProxyPattern(key?: string) {
  if (!key) {
    return '/proxy-default'
  }
  return `/proxy-${key}`
}

function createProxyItem(item: { baseURL: string, proxyPattern: string }, enableLog: boolean) {
  const proxy: Record<string, ProxyOptions> = {}

  proxy[item.proxyPattern] = {
    target: item.baseURL,
    changeOrigin: true,
    configure: (_proxy, options) => {
      _proxy.on('proxyReq', (_proxyReq, req, _res) => {
        if (!enableLog)
          return

        const requestUrl = `${lightBlue('[proxy url]')}: ${bgYellow(` ${req.method} `)} ${green(`${item.proxyPattern}${req.url}`)}`
        const proxyUrl = `${lightBlue('[real request url]')}: ${green(`${options.target}${req.url}`)}`

        consola.log(`${requestUrl}\n${proxyUrl}`)
      })
      _proxy.on('error', (_err, req, _res) => {
        if (!enableLog)
          return
        consola.log(bgRed(`Error: ${req.method} `), green(`${options.target}${req.url}`))
      })
    },
    rewrite: path => path.replace(new RegExp(`^${item.proxyPattern}`), ''),
  }

  return proxy
}

export function createViteProxy(env: ViteEnv, enable: boolean) {
  const isEnableHttpProxy = enable && env.VITE_HTTP_PROXY === 'Y'

  if (!isEnableHttpProxy)
    return undefined

  const isEnableProxyLog = env.VITE_PROXY_LOG === 'Y'

  // Extract from env
  const { VITE_SERVICE_BASE_URL, VITE_OTHER_SERVICE_BASE_URL } = env

  let other = {} as Record<string, string>
  try {
    if (VITE_OTHER_SERVICE_BASE_URL) {
      other = json5.parse(VITE_OTHER_SERVICE_BASE_URL)
    }
  }
  catch {
    console.error('VITE_OTHER_SERVICE_BASE_URL is not a valid json5 string')
  }

  const proxy: Record<string, ProxyOptions> = createProxyItem(
    {
      baseURL: VITE_SERVICE_BASE_URL,
      proxyPattern: createProxyPattern(),
    },
    isEnableProxyLog,
  )

  const otherKeys = Object.keys(other)
  otherKeys.forEach((key) => {
    Object.assign(
      proxy,
      createProxyItem(
        {
          baseURL: other[key],
          proxyPattern: createProxyPattern(key),
        },
        isEnableProxyLog,
      ),
    )
  })

  return proxy
}
