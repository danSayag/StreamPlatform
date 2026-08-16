package org.example.streamplatformnew.services;

import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
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
}
