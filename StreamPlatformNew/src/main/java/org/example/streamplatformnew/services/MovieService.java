package org.example.streamplatformnew.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

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


    public void createMovie(Movie newMovie){
        if(newMovie == null){
            throw new RuntimeException("new movie is null");
        }

        List<Movie> movies = movieRepository.findAll();

        for(Movie m : movies){
            if(m.getMovieName().equals(newMovie.getMovieName())){
                throw new RuntimeException("a movie by this name already exist");
            }
        }
        movieRepository.save(newMovie);
    }


    public void updateMovie(long oldMovieId , Movie newMovie){
        if(newMovie == null){
            throw new RuntimeException("new movie is null");
        }

        Movie oldMovie = movieRepository.findById(oldMovieId).get();
        Movie forDeleteMovie = oldMovie;


        oldMovie.setImage(newMovie.getImage());
        oldMovie.setCategory(newMovie.getCategory());
        oldMovie.setMovieName(newMovie.getMovieName());
        
        movieRepository.findAll().remove(forDeleteMovie);
        movieRepository.save(oldMovie);
    }


}
