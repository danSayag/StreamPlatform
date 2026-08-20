package org.example.streamplatformnew.config;

import java.util.List;

import org.example.streamplatformnew.models.Category;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.models.User;
import org.example.streamplatformnew.repositroies.MovieRepository;
import org.example.streamplatformnew.repositroies.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default "admin"/"admin" account and a batch of sample movies on
 * startup, for local testing only. Safe to run repeatedly: each seed only
 * runs if its data doesn't exist yet.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String ADMIN_USERNAME = "admin";

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Override with the ADMIN_PASSWORD env var; defaults to "admin" for local testing. */
    @Value("${app.admin.password:admin}")
    private String adminPassword;

    public DataInitializer(MovieRepository movieRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedMovies();
    }

    private void seedAdminUser() {
        if (userRepository.existsByUsername(ADMIN_USERNAME)) {
            return;
        }

        User admin = new User();
        admin.setUsername(ADMIN_USERNAME);
        admin.setPassword(passwordEncoder.encode(adminPassword)); // never stored in plain text
        admin.setRole("ROLE_ADMIN");
        userRepository.save(admin);

        log.info("Seeded admin account '{}'.", ADMIN_USERNAME);
        if ("admin".equals(adminPassword)) {
            log.warn("Admin account is using the default password. Set ADMIN_PASSWORD before exposing this app.");
        }
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
