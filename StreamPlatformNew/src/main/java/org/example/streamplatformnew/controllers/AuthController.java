package org.example.streamplatformnew.controllers;

import org.example.streamplatformnew.dto.AuthRequest;
import org.example.streamplatformnew.dto.AuthResponse;
import org.example.streamplatformnew.dto.ErrorResponse;
import org.example.streamplatformnew.models.User;
import org.example.streamplatformnew.repositroies.UserRepository;
import org.example.streamplatformnew.services.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    /** Signup rejects anything shorter than this, before the value ever reaches the encoder. */
    private static final int MIN_USERNAME_LENGTH = 3;
    private static final int MIN_PASSWORD_LENGTH = 8;

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (isBlank(request.username()) || isBlank(request.password())) {
            return badRequest("Username and password are required.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (BadCredentialsException ex) {
            // 401, not the 403 an uncaught AuthenticationException would produce: the client
            // needs to tell "wrong password" apart from "authenticated but not allowed".
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid username or password."));
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(DEFAULT_ROLE);

        return ResponseEntity.ok(new AuthResponse(
                jwtService.generateToken(request.username()), request.username(), role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        String username = request.username() == null ? null : request.username().trim();
        String password = request.password();

        if (isBlank(username) || isBlank(password)) {
            return badRequest("Username and password are required.");
        }
        if (username.length() < MIN_USERNAME_LENGTH) {
            return badRequest("Username must be at least " + MIN_USERNAME_LENGTH + " characters.");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            return badRequest("Password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("That username is already taken."));
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password)); // never stored in plain text
        user.setRole(DEFAULT_ROLE);
        userRepository.save(user);

        // Same shape as login, so the UI can drop the new account straight into a session.
        return ResponseEntity.ok(new AuthResponse(
                jwtService.generateToken(username), username, DEFAULT_ROLE));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static ResponseEntity<ErrorResponse> badRequest(String message) {
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }
}
