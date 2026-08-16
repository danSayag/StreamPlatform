package org.example.streamplatformnew.repositroies;

import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie,Long> {


}
