import { ReactJSFeature } from "@logary/plugin-react"
import Logary from "logary"
import { NextPageContext } from 'next'

export const NextJSFeature = 'nextjs'

export interface NextJSSupporter {
  readonly getInitialProps?: <P>(context: NextPageContext, logary: Logary) => P | Promise<P>;
}

export const name = 'plugins/nextjs'

export const features = [
  NextJSFeature,
  ReactJSFeature
]

export default function nextjs(logary: Logary) {
  logary.register({
    name,
    features,
    supports(feature) {
      return features.indexOf(feature) !== -1
    },
    run() {
      return () => { }
    }
  })
}

export { default as withLogary } from './withLogary'
