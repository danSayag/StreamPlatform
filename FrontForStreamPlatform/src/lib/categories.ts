/** SCI_FI -> Sci-Fi, ADVENTURE -> Adventure. */
export const labelOf = (category: string) =>
  category
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join('-')
