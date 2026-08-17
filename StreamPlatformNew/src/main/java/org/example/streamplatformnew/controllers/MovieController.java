package org.example.streamplatformnew.controllers;

import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.services.MovieService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {
    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping()
    public List<Movie> getAllMovies() {
        return  movieService.getAllMovies();
    }

    @GetMapping("/{movieName}")
    public Movie getMovieByName(@PathVariable String movieName) {
        return movieService.getMovieByName(movieName);
    }

    @GetMapping("/{category}")
    public List<Movie> getMoviesByCategory(@PathVariable Category category) {
        return movieService.getMoviesByCategory(category);
    }

    @GetMapping("/categories")
    public HashMap<Category , List<Movie>> putAllMoviesIntoCategories(){
        return movieService.putAllMoviesIntoCategories();
    }




}
