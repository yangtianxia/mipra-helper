export const FunctionalColors = [
  'colorPrimary',
  'colorSuccess',
  'colorWarning',
  'colorError',
  'colorInfo',
] as const

export type FunctionalColorKey = (typeof FunctionalColors)[number]

export type FunctionalColorType = Record<FunctionalColorKey, string>
