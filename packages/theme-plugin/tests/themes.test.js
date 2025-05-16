const {
  defaultSeed,
  defaultAlgorithm,
  darkAlgorithm,
} = require('../dist/themes')

describe('themes', () => {
  test('defaultAlgorithm', () => {
    const result = defaultAlgorithm(defaultSeed)
    console.log(`defaultAlgorithm: ${JSON.stringify(result)}\n`)
  })

  describe('darkAlgorithm', () => {
    const result = darkAlgorithm(defaultSeed)
    console.log(`darkAlgorithm: ${JSON.stringify(result)}\n`)
  })
})
