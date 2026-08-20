package org.example.streamplatformnew.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.example.streamplatformnew.dto.MovieRequest;
import org.example.streamplatformnew.exceptions.DuplicateMovieNameException;
import org.example.streamplatformnew.exceptions.MovieNotFoundException;
import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.CustomList;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.repositroies.CustomListRepository;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final CustomListRepository customListRepository;
    private final LevenshteinDistance levenshteinDistance;

    public MovieService(MovieRepository movieRepository ,
                        CustomListRepository customListRepository ,
                        LevenshteinDistance levenshteinDistance) {
        this.movieRepository = movieRepository;
        this.customListRepository = customListRepository;
        this.levenshteinDistance = levenshteinDistance;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }


    public HashMap<Category , List<Movie>> putAllMoviesIntoCategories(){
        HashMap<Category,List<Movie>> categoryMap = new HashMap<>();
        List<Movie> movies = movieRepository.findAll();

        for(Movie m : movies){
            categoryMap.computeIfAbsent(m.getCategory(), k -> new ArrayList<Movie>()).add(m);
        }

        return categoryMap;
    }

    /**
     * Built per call rather than cached in a field: the catalog changes whenever a movie
     * is added, edited or deleted, so a map filled once at construction would start
     * serving stale categories the first time an admin touches anything.
     *
     * <p>Returns an empty list, not null, for a category nobody has used yet.
     */
    public List<Movie> getMoviesByCategory(Category category) {
        return putAllMoviesIntoCategories().getOrDefault(category, List.of());
    }

    public Movie getMovieByName(String movieName) {
        return movieRepository.findByMovieNameIgnoreCase(movieName).orElse(null);
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new MovieNotFoundException(id));
    }


    public Movie createMovie(MovieRequest request) {
        String movieName = validatedName(request);

        if (movieRepository.existsByMovieNameIgnoreCase(movieName)) {
            throw new DuplicateMovieNameException(movieName);
        }

        return movieRepository.save(new Movie(
                movieName,
                request.category(),
                blankToNull(request.posterUrl()),
                blankToNull(request.videoPath())));
    }


    public Movie updateMovie(long movieId, MovieRequest request) {
        String movieName = validatedName(request);

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));

        movieRepository.findByMovieNameIgnoreCase(movieName)
                .filter(existing -> existing.getMovieId() != movieId)
                .ifPresent(existing -> {
                    throw new DuplicateMovieNameException(movieName);
                });

        movie.setMovieName(movieName);
        movie.setCategory(request.category());
        movie.setPosterUrl(blankToNull(request.posterUrl()));
        movie.setVideoPath(blankToNull(request.videoPath()));
        return movieRepository.save(movie);
    }

    private static String validatedName(MovieRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("A movie body is required.");
        }
        if (request.movieName() == null || request.movieName().isBlank()) {
            throw new IllegalArgumentException("Movie name is required.");
        }
        if (request.category() == null) {
            throw new IllegalArgumentException("Category is required.");
        }
        return request.movieName().trim();
    }

    /** A cleared field arrives as "", which should unset the column rather than store it. */
    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }


    public List<Movie> searchMovies(String query){
        if(query == null){
            return movieRepository.findAll();
        }
        List<Movie> movies = new ArrayList<>();

        List<Movie> allMovies = movieRepository.findAll();

        for (Movie movie : allMovies) {
            if(movie.getMovieName().toLowerCase().contains(query.toLowerCase())){
                movies.add(movie);
            }
        }

        if (movies.isEmpty()) {
            movies = levenshteinDistance.searchMovies(allMovies, query);
        }
        return movies;
    }


    /**
     * Removes a movie, and first takes it out of any custom list holding it.
     *
     * <p>custom_list_movies has a foreign key onto movies, so deleting a listed title
     * without clearing those rows fails on the constraint. Transactional because the
     * detach and the delete have to succeed or fail together.
     */
    @Transactional
    public void deleteMovie(long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));

        for (CustomList list : customListRepository.findAll()) {
            if (list.getMovies().removeIf(listed -> listed.getMovieId() == movieId)) {
                customListRepository.save(list);
            }
        }

        movieRepository.delete(movie);
    }

    /** Delete by name, for DELETE /movies with a body. Same list handling as above. */
    @Transactional
    public void deleteMovie(MovieRequest request) {
        if (request == null || request.movieName() == null || request.movieName().isBlank()) {
            throw new IllegalArgumentException("A movie name is required.");
        }

        String movieName = request.movieName().trim();
        Movie movie = movieRepository.findByMovieNameIgnoreCase(movieName)
                .orElseThrow(() -> new MovieNotFoundException(movieName));

        deleteMovie(movie.getMovieId());
    }

}
