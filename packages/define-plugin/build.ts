import builderBatch from '../../scripts/build.batch'

builderBatch([
  {
    root: true,
    name: 'index',
    filepath: 'index.ts',
  },
  {
    name: 'watch-file',
    filepath: 'watch-file.ts',
  },
])
