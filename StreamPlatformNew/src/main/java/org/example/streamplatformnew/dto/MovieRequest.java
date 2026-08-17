package org.example.streamplatformnew.dto;

import org.example.streamplatformnew.models.Category;

/**
 * Create/update payload for a movie.
 *
 * <p>Deliberately not the {@link org.example.streamplatformnew.models.Movie} entity: that
 * carries a {@code javax.swing.ImageIcon} field which has no sane JSON form, and binding
 * the entity directly would let a client choose its own {@code movieId}.
 */
public record MovieRequest(String movieName, Category category) {
}
