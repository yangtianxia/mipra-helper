import builderBatch from '../../scripts/build.batch'

builderBatch([
  {
    root: true,
    name: 'index',
    filepath: 'index.ts',
  },
  {
    name: 'define-config',
    filepath: 'define-config.ts',
  },
])
