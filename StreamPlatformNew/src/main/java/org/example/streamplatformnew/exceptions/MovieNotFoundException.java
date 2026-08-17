package org.example.streamplatformnew.exceptions;

/** Raised when an operation targets a movie id that does not exist. Mapped to 404. */
public class MovieNotFoundException extends RuntimeException {

    public MovieNotFoundException(long movieId) {
        super("No movie found with id " + movieId + ".");
    }
}
