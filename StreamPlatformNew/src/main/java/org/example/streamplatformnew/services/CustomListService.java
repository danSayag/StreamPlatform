package org.example.streamplatformnew.services;

import jakarta.transaction.Transactional;
import org.example.streamplatformnew.models.CustomList;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.repositroies.CustomListRepository;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomListService {

    private final CustomListRepository customListRepository;
    private final MovieRepository movieRepository;

    public CustomListService(CustomListRepository customListRepository, MovieRepository movieRepository) {
        this.customListRepository = customListRepository;
        this.movieRepository = movieRepository;
    }

    public List<CustomList> getAllCustomLists() {
        return customListRepository.findAll();
    }


    public void createList(String name , String description) {
         customListRepository.save(new CustomList(name, description));
    }

    @Transactional
    public void addMovieToList(Long listId, Long movieId) {
        CustomList list = findList(listId);
        Movie movie = findMovie(movieId);

        boolean alreadyThere = list.getMovies().stream()
                .anyMatch(m -> m.getMovieId() == movie.getMovieId());
        if (alreadyThere) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie already in list");
        }

        list.getMovies().add(movie);
        customListRepository.save(list);
    }

    @Transactional
    public void removeMovieFromList(Long listId, Long movieId) {
        CustomList list = findList(listId);
        Movie movie = findMovie(movieId);

        list.getMovies().removeIf(m -> m.getMovieId() == movie.getMovieId());
        customListRepository.save(list);
    }

    private CustomList findList(Long listId) {
        return customListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
    }

    private Movie findMovie(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
    }






}
