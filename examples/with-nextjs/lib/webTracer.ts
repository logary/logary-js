import { B3Format } from '@opentelemetry/core'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request'
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';

export const provider = new WebTracerProvider({
  httpTextFormat: new B3Format(),
  scopeManager: new ZoneScopeManager(),
  plugins: [
    new DocumentLoad(),
    new XMLHttpRequestPlugin({
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    })
  ]
})

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const tracer = provider.getTracer('with-nextjs')

export default tracer