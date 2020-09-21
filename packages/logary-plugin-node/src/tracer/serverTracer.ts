import Logary, { TracerModule } from "logary"
import { SpanExporter, SimpleSpanProcessor } from "@opentelemetry/tracing"
import { NodeTracerProvider } from '@opentelemetry/node'

// HTTP sample: https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/http
// HTTP sample: https://github.com/open-telemetry/opentelemetry-js/blob/master/examples/http/client.js
// Custom exporters/processors: https://github.com/open-telemetry/opentelemetry-js/blob/master/examples/http/tracer.js
export default function create(delegator: SpanExporter, _: Logary): TracerModule {
  console.log('Running Node.js version:', process.version)

  const provider = new NodeTracerProvider()

  provider.addSpanProcessor(new SimpleSpanProcessor(delegator))
  
  // Initialize the provider
  provider.register()

  return { provider }
}