package org.example.streamplatformnew.services;

import java.util.List;

import org.example.streamplatformnew.repositroies.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Bridges the persisted {@link org.example.streamplatformnew.models.User} entity to Spring
 * Security. Supplies the UserDetailsService bean that SecurityConfig and JwtAuthFilter need.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User
                        .withUsername(user.getUsername())
                        .password(user.getPassword()) // already BCrypt-encoded at rest
                        .authorities(List.of(new SimpleGrantedAuthority(user.getRole())))
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("No user found with username: " + username));
    }
}
