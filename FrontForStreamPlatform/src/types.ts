export type Movie = {
  // The API serialises this as "movieId" (Movie.movieId), not "Id".
  movieId: number
  movieName: string
  category?: string
  // No poster field exists server-side yet: Movie.image is a javax.swing.ImageIcon, which
  // a browser cannot render. These stay optional so a future string field just works.
  posterUrl?: string
  poster?: string
  imageUrl?: string
}

export const posterOf = (movie: Movie) =>
  movie.posterUrl ?? movie.poster ?? movie.imageUrl ?? null

export const initialOf = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase()
