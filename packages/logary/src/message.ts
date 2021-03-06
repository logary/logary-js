/* eslint no-shadow: 0 */

import template, { Templated } from './formatting/template'
import { hexDigest } from './utils/hasher'
import { Money } from "./money"
import { SpanContext, Status, CanonicalCode, SpanKind, TimedEvent, Attributes } from "@opentelemetry/api"
import { SpanData } from "./trace"
import getTimestamp, { EpochNanoSeconds, hrTimeToEpochNanoSeconds } from "./utils/time"
import { ReadableSpan } from "@opentelemetry/tracing"
import { ErrorInfo } from "./types"

export enum LogLevel {
  verbose = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6
}

export interface LogaryMessage {
  readonly id: string;
  readonly name: string[];
  // es-
  readonly level: LogLevel;
  readonly timestamp: EpochNanoSeconds;
  readonly fields?: Record<string, unknown>;
  readonly context?: Record<string, unknown>;
  readonly parentSpanId?: string;
}

export class EventMessage implements LogaryMessage {
  constructor(
    public event: string,
    public monetaryValue: Money | null = null,
    public error: Error | ErrorInfo | null = null,
    public level: LogLevel = LogLevel.info,
    timestamp: EpochNanoSeconds | null = getTimestamp(),
    public fields: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public name: string[] = [],
    public parentSpanId?: string)
  {
    const vars = this.error == null ? { ...fields, ...context } : { ...fields, ...context, error: this.error }
    this.timestamp = timestamp || getTimestamp()
    this.templated = template(event, vars)
    this.id = hexDigest(this)
  }

  templated: Templated
  timestamp: EpochNanoSeconds
  id: string
  type: 'event' = 'event'

  static ofTimedEvent(te: TimedEvent, parentSpanId?: string): EventMessage {
    const timestamp = hrTimeToEpochNanoSeconds(te.time)
    return new EventMessage(te.name, null, null, LogLevel.info, timestamp, {}, {}, [], parentSpanId)
  }
}

export class SpanMessage implements LogaryMessage, SpanData {
  constructor(
    public spanContext: SpanContext,
    public label: string,
    public level: LogLevel = LogLevel.info,
    public kind: SpanKind = SpanKind.CLIENT,
    public status: Status = { code: CanonicalCode.OK },
    public events: EventMessage[] = [],
    public attrs: Attributes = {},
    public context: Attributes = {},
    started: EpochNanoSeconds | null = getTimestamp(),
    finished?: EpochNanoSeconds | null)
  {
    this.started = started || getTimestamp()
    this.finished = finished || this.started + BigInt(1)
    this.id = hexDigest(this)
  }

  id: string
  finished: EpochNanoSeconds
  started: EpochNanoSeconds
  type: 'span' = 'span'

  get name() { return [ this.label ] }
  get timestamp() { return this.started }
  get fields() { return this.attrs }

  static ofReadableSpan(rs: ReadableSpan): SpanMessage {
    const level = rs.attributes['error'] === true ? LogLevel.error : LogLevel.info
    return new SpanMessage(
      rs.spanContext,
      rs.name,
      level,
      rs.kind,
      rs.status,
      rs.events.map(e => EventMessage.ofTimedEvent(e, rs.spanContext.spanId)),
      rs.attributes,
      {},
      hrTimeToEpochNanoSeconds(rs.startTime),
      hrTimeToEpochNanoSeconds(rs.endTime)
    )
  }
}

export class SetUserPropertyMessage implements LogaryMessage {
  constructor(
    public userId: string,
    public key: string,
    public value: unknown,
    public name: string[],
    timestamp: EpochNanoSeconds | null = null,
    id?: string
  ) {
    this.level = LogLevel.info
    this.fields = {}
    this.context = {}
    this.timestamp = timestamp || getTimestamp()
    this.id = id || hexDigest(this)
  }
  id: string
  level: LogLevel
  fields: Record<string, unknown>
  context: Record<string, unknown>
  timestamp: EpochNanoSeconds
  type: 'setUserProperty' = 'setUserProperty'
}

export class IdentifyUserMessage implements LogaryMessage {
  constructor(
    public prevUserId: string,
    public newUserId: string,
    public level: LogLevel = LogLevel.info,
    public fields: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public name: string[] = [],
    timestamp: EpochNanoSeconds | null = null,
  ) {
    this.timestamp = timestamp || getTimestamp()
    this.id = hexDigest(this)
  }
  id: string
  timestamp: EpochNanoSeconds
  type: 'identifyUser' = 'identifyUser'
}

export class ForgetUserMessage implements LogaryMessage {
  constructor(
    public userId: string,
    public name: string[] = [],
    public fields: Record<string, unknown> = {},
    public context: Record<string, unknown> = {},
    public parentSpanId?: string | undefined,
    timestamp?: EpochNanoSeconds | undefined,
  ) {
    this.name = name
    this.level = LogLevel.info
    this.timestamp = timestamp || getTimestamp()
    this.id = hexDigest(this)
  }
  id: string
  timestamp: EpochNanoSeconds
  type: 'forgetUser' = 'forgetUser'
  level: LogLevel
}

export type Message =
  | SpanMessage
  | EventMessage
  | SetUserPropertyMessage
  | IdentifyUserMessage
  | ForgetUserMessage