package org.example.streamplatformnew.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Mapped to "users": USER is a reserved word in H2, so the default table name fails to create.
@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    /** Granted authority for this account, e.g. ROLE_USER or ROLE_ADMIN. */
    @Column(nullable = false)
    private String role = "ROLE_USER";

}
