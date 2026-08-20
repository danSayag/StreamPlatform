package org.example.streamplatformnew.dto;

/** Credentials posted to {@code /api/v1/auth/login} and {@code /api/v1/auth/signup}. */
public record AuthRequest(String username, String password) {
}
