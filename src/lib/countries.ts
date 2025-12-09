export const Countries = {
  CY: 'Cyprus',
  GR: 'Greece',
} as const

export type CountryCode = keyof typeof Countries

export const countryOptions = Object.entries(Countries).map(([code, name]) => ({
  label: name,
  value: code,
}))
