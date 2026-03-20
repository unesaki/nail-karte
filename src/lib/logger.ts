// Sentry ラッパー
// @sentry/nextjs セットアップ後に有効化: npx @sentry/wizard@latest -i nextjs

type LogLevel = 'info' | 'warning' | 'error'

interface LogExtra {
  [key: string]: unknown
}

function log(level: LogLevel, message: string, extra?: LogExtra) {
  if (process.env.NODE_ENV === 'development') {
    const fn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log
    fn(`[${level.toUpperCase()}] ${message}`, extra ?? '')
  }

  // Sentry セットアップ後にここを有効化:
  // import * as Sentry from '@sentry/nextjs'
  // Sentry.addBreadcrumb({ message, level, data: extra })
}

export const logger = {
  info: (message: string, extra?: LogExtra) => log('info', message, extra),
  warn: (message: string, extra?: LogExtra) => log('warning', message, extra),
  error: (message: string, extra?: LogExtra) => {
    log('error', message, extra)
    // Sentry セットアップ後にここを有効化:
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.captureException(extra?.err ?? new Error(message), { extra })
  },
}
