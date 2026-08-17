package org.example.streamplatformnew.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.example.streamplatformnew.dto.MovieRequest;
import org.example.streamplatformnew.exceptions.DuplicateMovieNameException;
import org.example.streamplatformnew.exceptions.MovieNotFoundException;
import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.springframework.stereotype.Service;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
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

    public List<Movie> getMoviesByCategory(Category category) {
        List<Movie> movies = movieRepository.findAll();

        movies = movies.stream()
                .filter(movie -> movie.getCategory().getName().equals(category.getName()))
                .toList();
        return movies;
    }

    public Movie getMovieByName(String movieName) {
        List<Movie> movies = movieRepository.findAll();

        return movies.stream().findFirst().get().getMovieName().equals(movieName) ? movies.get(0) : null;
    }


    public Movie createMovie(MovieRequest request) {
        String movieName = validatedName(request);

        if (movieRepository.existsByMovieNameIgnoreCase(movieName)) {
            throw new DuplicateMovieNameException(movieName);
        }

        return movieRepository.save(new Movie(movieName, request.category()));
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

}
