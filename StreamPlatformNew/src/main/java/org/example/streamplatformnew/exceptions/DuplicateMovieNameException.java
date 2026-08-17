package org.example.streamplatformnew.exceptions;

/**
 * Raised before saving a movie whose name is already taken. Mapped to 409 - without it the
 * unique constraint on movie_name surfaces as an opaque 500.
 */
public class DuplicateMovieNameException extends RuntimeException {

    public DuplicateMovieNameException(String movieName) {
        super("A movie named \"" + movieName + "\" already exists.");
    }
}
