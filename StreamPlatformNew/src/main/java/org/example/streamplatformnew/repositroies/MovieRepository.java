package org.example.streamplatformnew.repositroies;

import org.example.streamplatformnew.models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MovieRepository extends JpaRepository<Movie,Long> {


}
