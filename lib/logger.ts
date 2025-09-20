import { getEnv } from "./env"

type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace"

const levels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
}

function now() {
  return new Date().toISOString()
}

export const logger = (() => {
  const env = getEnv()
  const min = levels[env.LOG_LEVEL]
  const log = (lvl: LogLevel, ...args: any[]) => {
    if (levels[lvl] <= min) {
      // eslint-disable-next-line no-console
      console[lvl === "error" ? "error" : lvl === "warn" ? "warn" : "log"](`[${now()}] [${lvl}]`, ...args)
    }
  }
  return {
    error: (...a: any[]) => log("error", ...a),
    warn: (...a: any[]) => log("warn", ...a),
    info: (...a: any[]) => log("info", ...a),
    debug: (...a: any[]) => log("debug", ...a),
    trace: (...a: any[]) => log("trace", ...a),
  }
})()


