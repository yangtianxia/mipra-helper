import builderBatch from '../../scripts/build.batch'

builderBatch([
  {
    root: true,
    name: 'index',
    filepath: 'index.ts',
  },
  {
    name: 'env',
    filepath: 'env.ts',
  },
])
