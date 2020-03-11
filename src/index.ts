export * from './keyvalue'
export * from './message'
export * from './logger'
export * from './trace'

import Logary from './impl'
import { LogLevel } from './message'
import ConsoleTarget from './targets/console'
import { Subscription } from 'rxjs'
import { Logger } from './logger'
import { LogFunction } from '@opentelemetry/api'

export default Logary


// what follows is the convenience API (every logging lib should be easy to get started with!)

let instance: Logary | null
let sub: Subscription | null
let logger: Logger | null

/**
 * Gets the global Logary instance, unless a user-supplied Logary was given.
 * @param userSupplied The Logary that was user-supplied; the caller owns this instance's lifetime
 */
export function getLogaryInstance(userSupplied?: Logary): Logary {
  if (userSupplied != null) {
    if (sub != null) {
      sub.unsubscribe()
      sub = null
    }
    return instance = userSupplied
  }

  if (instance == null) {
    instance = new Logary({
      minLevel: LogLevel.verbose,
      serviceName: 'Logary',
      targets: [new ConsoleTarget()]
    })
    sub = instance.start()
    logger = instance.getLogger()
  }

  return instance
}

function getLogger(): Logger {
  if (logger != null) return logger
  const logary = getLogaryInstance()
  return logger = logary.getLogger()
}

export const verbose: LogFunction = (m, args) => getLogger().verbose(m, args)
export const debug: LogFunction = (m, args) => getLogger().debug(m, args)
export const info: LogFunction = (m, args) => getLogger().info(m, args)
export const warn: LogFunction = (m, args) => getLogger().warn(m, args)
export const error: LogFunction = (m, args) => getLogger().error(m, args)
export const fatal: LogFunction = (m, args) => getLogger().fatal(m, args)