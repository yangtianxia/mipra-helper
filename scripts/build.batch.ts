import { builder, finishLogger, type BundleOptions } from './build'

const builderBatch = (entry: BundleOptions[]) => {
  const files = [] as string[]
  const external = entry.map((el) => `*/${el.name}`)
  entry
    .reduce(
      (promise, options) =>
        promise.then(() => {
          if (!options.root) {
            options.external = external
            files.push(options.name)
          }
          return builder(options)
        }),
      Promise.resolve()
    )
    .then(() => {
      finishLogger(`[ ${files.join('、')} ]`)
    })
}

export default builderBatch
