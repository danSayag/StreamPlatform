package org.example.streamplatformnew.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import javax.swing.*;

@Entity
@Getter
@Setter
@Table(name = "movies")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long movieId;

    @Column(unique = true)
    private String movieName;

    private Category category;

    private ImageIcon image;

    protected Movie() {
        // Required by JPA/Hibernate for entity instantiation.
    }

    public Movie(String movieName){
        this.movieName = movieName;
    }


    public Movie(String movieName , Category category){
        this.movieName = movieName;
        this.category = category;
    }

    public Movie(String movieName , Category category, ImageIcon image ){
        this.movieName = movieName;
        this.category = category;
        this.image = image;
    }




}
