package org.example.streamplatformnew.repositroies;

import java.util.Optional;

import org.example.streamplatformnew.models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MovieRepository extends JpaRepository<Movie,Long> {

    // Case-insensitive so "The Last Horizon" and "the last horizon" cannot both exist.
    Optional<Movie> findByMovieNameIgnoreCase(String movieName);

    boolean existsByMovieNameIgnoreCase(String movieName);

}
