package org.example.streamplatformnew.dto;

/**
 * Successful login/signup payload. The role travels in the body because the JWT itself
 * carries only {@code sub} and timestamps - no role claim.
 */
public record AuthResponse(String token, String username, String role) {
}
