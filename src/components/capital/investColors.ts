// פלטת צבעים יציבה לחשבונות בגרפי ההשקעה
const PALETTE = [
  '#5f7f5f',
  '#7b6bb0',
  '#4a8fb0',
  '#c97b4a',
  '#cf5b6a',
  '#3aa0a0',
  '#b08a3a',
  '#8a8f5f',
  '#d08bb0',
  '#6b6862',
]

export function accountColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}
