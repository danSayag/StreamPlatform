package org.example.streamplatformnew.services;

import org.example.streamplatformnew.exceptions.VideoNotAvailableException;
import org.example.streamplatformnew.models.Movie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Turns a stored media path - a movie's {@code videoPath} or {@code posterUrl} - into a
 * readable file on disk.
 *
 * <p>The path comes from whatever an admin typed into the panel, so it is never trusted:
 * it is resolved against {@code app.media.root} and the result must still sit inside that
 * folder. That rejects both {@code ..\..\windows\system32\config\sam} and an absolute
 * path like {@code C:\Users\me\.ssh\id_rsa} - on Windows {@code root.resolve(absolute)}
 * hands back the absolute path, which then fails the containment check below.
 *
 * <p>Without this the endpoint would be an arbitrary-file-read primitive: any admin could
 * point a "movie" at any file the server process can open and stream it out over HTTP.
 */
@Service
public class MediaStreamService {

    private final Path root;

    public MediaStreamService(@Value("${app.media.root}") String mediaRoot) {
        this.root = Paths.get(mediaRoot).toAbsolutePath().normalize();
    }

    /** The folder admins drop video files into. Shown in the panel so the hint stays true. */
    public Path getRoot() {
        return root;
    }

    public Resource resolveVideo(Movie movie) {
        return resolve(movie.getVideoPath(), "video");
    }

    public Resource resolvePoster(Movie movie) {
        return resolve(movie.getPosterUrl(), "poster");
    }

    /**
     * An absolute path is accepted as long as it still lands inside the media root -
     * {@code D:\MovieLib\video\film.mp4} works when the root is {@code D:\MovieLib},
     * because Path.resolve hands back the absolute path and the containment check below
     * then passes. Anything pointing elsewhere is refused.
     */
    private Resource resolve(String rawPath, String kind) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new VideoNotAvailableException("No " + kind + " is attached to this movie yet.");
        }

        Path candidate;
        try {
            candidate = root.resolve(rawPath).normalize();
        } catch (InvalidPathException ex) {
            throw new VideoNotAvailableException("This movie's " + kind + " path is not usable.");
        }

        if (!candidate.startsWith(root) || !Files.isRegularFile(candidate) || !Files.isReadable(candidate)) {
            throw new VideoNotAvailableException("This movie's " + kind + " file could not be opened.");
        }
        return new FileSystemResource(candidate);
    }

    /**
     * Content type from the file itself, falling back to MP4. A wrong type here makes the
     * browser refuse to play a file that is otherwise fine.
     */
    public MediaType contentTypeOf(Resource media, MediaType fallback) {
        try {
            Path path = media.getFile().toPath();
            String probed = Files.probeContentType(path);
            if (probed != null) {
                return MediaType.parseMediaType(probed);
            }
        } catch (IOException | IllegalArgumentException ignored) { // InvalidPathException extends IllegalArgumentException
            // Fall through to the default below.
        }
        return fallback;
    }
}
