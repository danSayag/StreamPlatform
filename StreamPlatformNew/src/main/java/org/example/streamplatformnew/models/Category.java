package org.example.streamplatformnew.models;

import lombok.Getter;

@Getter
public enum Category {
    DRAMA("Drama"),
    SCI_FI("Sci-Fi"),
    COMEDY("Comedy"),
    HORROR("Horror"),
    ADVENTURE("Adventure");

    private final String name;


    Category(String name) {
        this.name = name;
    }

}
