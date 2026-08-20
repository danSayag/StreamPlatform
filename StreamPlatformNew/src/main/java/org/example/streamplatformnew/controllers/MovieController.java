package org.example.streamplatformnew.controllers;

import org.example.streamplatformnew.dto.MovieRequest;
import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.services.MovieService;
import org.example.streamplatformnew.services.MediaStreamService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {
    /** One megabyte per chunk when the player asks for an open-ended range. */
    private static final long CHUNK_SIZE = 1024L * 1024L;

    private final MovieService movieService;
    private final MediaStreamService mediaStreamService;

    public MovieController(MovieService movieService, MediaStreamService mediaStreamService) {
        this.movieService = movieService;
        this.mediaStreamService = mediaStreamService;
    }

    @GetMapping()
    public List<Movie> getAllMovies() {
        return  movieService.getAllMovies();
    }

    // Writes are admin-only: they fall through to anyRequest().hasRole("ADMIN") in
    // SecurityFilterChain, since only GET /movies/** is relaxed to authenticated().
    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public Movie createMovie(@RequestBody MovieRequest request){
        return movieService.createMovie(request);
    }


    // PUT is the natural verb; POST stays mapped so the original shape keeps working.
    @RequestMapping(value = "/{movieId}", method = {RequestMethod.PUT, RequestMethod.POST})
    public Movie updateMovie(@PathVariable Long movieId , @RequestBody MovieRequest request){
        return movieService.updateMovie(movieId, request);
    }


    // Admin-only, like the other writes: only GET /movies/** is relaxed to authenticated().
    @DeleteMapping("/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMovie(@PathVariable Long movieId) {
        movieService.deleteMovie(movieId);
    }


    /** The category values an admin can pick from, with their display labels. */
    @GetMapping("/category-options")
    public List<CategoryOption> getCategoryOptions(){
        return Arrays.stream(Category.values())
                .map(category -> new CategoryOption(category.name(), category.getName()))
                .toList();
    }

    public record CategoryOption(String value, String label) {}


    /**
     * Streams the movie's video file. Two-segment path, so it never collides with the
     * single-segment /movies/{movieName} lookup below.
     *
     * <p>Answers byte ranges because that is what a &lt;video&gt; element asks for: without
     * 206 support the browser cannot seek, and Safari will not start playback at all.
     *
     * <p>Writes to the response directly rather than returning a ResourceRegion: Spring 7
     * no longer registers a converter for that type, and the resulting
     * HttpMessageNotWritableException surfaces as a bare 403 from the /error dispatch.
     */
    @GetMapping("/{movieId}/video")
    public void streamVideo(@PathVariable Long movieId,
                            @RequestHeader HttpHeaders headers,
                            HttpServletResponse response) throws IOException {
        Resource video = mediaStreamService.resolveVideo(movieService.getMovieById(movieId));
        long length = video.contentLength();

        response.setHeader(HttpHeaders.ACCEPT_RANGES, "bytes");
        response.setContentType(mediaStreamService.contentTypeOf(video, MediaType.valueOf("video/mp4")).toString());

        List<HttpRange> ranges = headers.getRange();

        // No Range header: hand back the whole file, but still advertise range support so
        // the player knows it may seek later.
        if (ranges.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentLengthLong(length);
            try (InputStream in = video.getInputStream()) {
                StreamUtils.copy(in, response.getOutputStream());
            }
            return;
        }

        HttpRange range = ranges.get(0);
        long start = range.getRangeStart(length);
        // Cap an open-ended "bytes=0-" so one request cannot pull the entire film.
        long end = Math.min(range.getRangeEnd(length), start + CHUNK_SIZE - 1);

        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + length);
        response.setContentLengthLong(end - start + 1);
        try (InputStream in = video.getInputStream()) {
            StreamUtils.copyRange(in, response.getOutputStream(), start, end);
        }
    }


    /**
     * Serves the poster image. Same containment rules as the video, and served by the
     * server for the same reason: an <img> cannot carry an Authorization header, and a
     * path like D:\MovieLib\poster\kiss.png means nothing to a browser.
     *
     * <p>No range handling - posters are small and players never seek them.
     */
    @GetMapping("/{movieId}/poster")
    public void streamPoster(@PathVariable Long movieId, HttpServletResponse response) throws IOException {
        Resource poster = mediaStreamService.resolvePoster(movieService.getMovieById(movieId));

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(mediaStreamService.contentTypeOf(poster, MediaType.IMAGE_JPEG).toString());
        response.setContentLengthLong(poster.contentLength());
        try (InputStream in = poster.getInputStream()) {
            StreamUtils.copy(in, response.getOutputStream());
        }
    }


    @GetMapping("/{movieName}")
    public Movie getMovieByName(@PathVariable String movieName) {
        return movieService.getMovieByName(movieName);
    }


    @GetMapping("/search/{query}")
    public List<Movie> searchMovies(@PathVariable String query){
        return movieService.searchMovies(query);
    }


    @GetMapping("/search/category/{category}")
    public List<Movie> getMoviesByCategory(@PathVariable Category category) {
        return movieService.getMoviesByCategory(category);
    }

    
    @GetMapping("/categories")
    public HashMap<Category , List<Movie>> putAllMoviesIntoCategories(){
        return movieService.putAllMoviesIntoCategories();
    }

    @DeleteMapping()
    public void deleteMovie(@RequestBody MovieRequest movie){
        movieService.deleteMovie(movie);
    }






}
