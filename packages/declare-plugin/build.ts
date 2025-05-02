import builderBatch from '../../scripts/build.batch'

builderBatch([
  {
    root: true,
    name: 'index',
    filepath: 'index.ts',
  },
  {
    name: 'vant-icons',
    filepath: 'vant-icons.ts',
  },
])
