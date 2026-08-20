export type Movie = {
  // The API serialises this as "movieId" (Movie.movieId), not "Id".
  movieId: number
  movieName: string
  category?: string
  // posterUrl is the real server field. The other two are kept as fallbacks so a response
  // shaped by an older build still renders. (Movie.image is a javax.swing.ImageIcon and
  // always serialises as null - a browser cannot do anything with it.)
  posterUrl?: string
  poster?: string
  imageUrl?: string
  // Relative to the server's app.media.root. Never a URL the browser can use directly -
  // go through videoSrcOf below, which points at the streaming endpoint.
  videoPath?: string
}

/** True for values a browser can load as-is; anything else is a server-side file path. */
const isDirectlyLoadable = (value: string) => /^(https?:|data:|blob:)/i.test(value)

/**
 * The URL an <img> should load for a movie's poster, or null when there is none.
 *
 * A full http(s) URL is used untouched. Anything else is a path inside the server's media
 * library - "D:\MovieLib\poster\kiss.png" is meaningless to a browser - so it goes
 * through the poster endpoint, which reads the file and streams it back.
 */
export const posterSrcOf = (movie: Movie, token: string | undefined) => {
  const raw = movie.posterUrl ?? movie.poster ?? movie.imageUrl
  if (!raw) return null
  if (isDirectlyLoadable(raw)) return raw
  if (!token) return null
  return `/movies/${movie.movieId}/poster?access_token=${encodeURIComponent(token)}`
}

export const initialOf = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase()

/**
 * The URL a <video> element should load for a movie, or null when nothing is attached.
 *
 * <p>The token rides in the query string because the browser fetches a video src itself -
 * there is no way to set an Authorization header on it. The server only honours
 * ?access_token= for this one endpoint.
 */
export const videoSrcOf = (movie: Movie, token: string | undefined) => {
  if (!movie.videoPath) return null
  if (isDirectlyLoadable(movie.videoPath)) return movie.videoPath
  if (!token) return null
  return `/movies/${movie.movieId}/video?access_token=${encodeURIComponent(token)}`
}
