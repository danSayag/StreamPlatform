package org.example.streamplatformnew.controllers;

import org.example.streamplatformnew.dto.MovieRequest;
import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.services.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
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


    /** The category values an admin can pick from, with their display labels. */
    @GetMapping("/category-options")
    public List<CategoryOption> getCategoryOptions(){
        return Arrays.stream(Category.values())
                .map(category -> new CategoryOption(category.name(), category.getName()))
                .toList();
    }

    public record CategoryOption(String value, String label) {}


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
