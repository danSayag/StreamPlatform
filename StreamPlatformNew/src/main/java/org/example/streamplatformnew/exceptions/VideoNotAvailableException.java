package org.example.streamplatformnew.exceptions;

/**
 * The movie exists but has no playable video behind it: no path was set, the path points
 * outside {@code app.media.root}, or the file is missing or unreadable.
 *
 * <p>Deliberately one exception for all four cases. Telling a caller apart "no file there"
 * from "that path is off-limits" would let them map the server's filesystem by probing.
 */
public class VideoNotAvailableException extends RuntimeException {
    public VideoNotAvailableException(String message) {
        super(message);
    }
}
