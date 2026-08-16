package org.example.streamplatformnew.config;

import java.util.List;

import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds a default "admin"/"admin" account and a batch of sample movies on
 * startup, for local testing only. Safe to run repeatedly: each seed only
 * runs if its data doesn't exist yet.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final MovieRepository movieRepository;

    public DataInitializer(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Override
    public void run(String... args) {
        seedMovies();
    }

    private void seedMovies() {
        if (movieRepository.count() > 0) {
            return;
        }

        List<Movie> movies = List.of(
                new Movie("The Last Horizon", Category.SCI_FI),
                new Movie("Neon Skyline", Category.SCI_FI),
                new Movie("Quantum Drift", Category.SCI_FI),
                new Movie("Echoes of Tomorrow", Category.SCI_FI),
                new Movie("The Silent Orchard", Category.DRAMA),
                new Movie("Autumn in Ravenwood", Category.DRAMA),
                new Movie("A Thousand Letters", Category.DRAMA),
                new Movie("The Weight of Water", Category.DRAMA),
                new Movie("Awkward Family Dinner", Category.COMEDY),
                new Movie("Two Left Feet", Category.COMEDY),
                new Movie("The Office Prank War", Category.COMEDY),
                new Movie("Roommates from Hell", Category.COMEDY),
                new Movie("The Hollow House", Category.HORROR),
                new Movie("Whispers in the Attic", Category.HORROR),
                new Movie("Midnight Static", Category.HORROR),
                new Movie("The Basement Below", Category.HORROR),
                new Movie("Peak of No Return", Category.ADVENTURE),
                new Movie("The Lost Expedition", Category.ADVENTURE),
                new Movie("Treasure of the Sunken Isles", Category.ADVENTURE),
                new Movie("Across the Wild River", Category.ADVENTURE)
        );

        movieRepository.saveAll(movies);
        log.info("Seeded {} sample movies for testing purposes.", movies.size());
    }
}
