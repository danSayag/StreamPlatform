package org.example.streamplatformnew.repositroies;

import java.util.Optional;

import org.example.streamplatformnew.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

}
