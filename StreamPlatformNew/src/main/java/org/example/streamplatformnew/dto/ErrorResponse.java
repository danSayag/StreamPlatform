package org.example.streamplatformnew.dto;

/** JSON error body, so the frontend never has to parse an empty or text/plain failure. */
public record ErrorResponse(String message) {
}
