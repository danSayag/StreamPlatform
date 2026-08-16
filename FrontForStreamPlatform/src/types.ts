export type Movie = {
  Id: number
  movieName: string
  posterUrl?: string
  poster?: string
  imageUrl?: string
}

export const posterOf = (movie: Movie) =>
  movie.posterUrl ?? movie.poster ?? movie.imageUrl ?? null

export const initialOf = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase()
