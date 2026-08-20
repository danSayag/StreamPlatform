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

    /** Poster to show on the card. An http(s) URL, or null for the initial placeholder. */
    private String posterUrl;

    /**
     * Where the video lives. Either an http(s) URL the browser loads directly, or a path
     * relative to {@code app.media.root} that {@link
     * org.example.streamplatformnew.services.VideoStreamService} streams from disk.
     */
    private String videoPath;

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

    public Movie(String movieName, Category category, String posterUrl, String videoPath){
        this.movieName = movieName;
        this.category = category;
        this.posterUrl = posterUrl;
        this.videoPath = videoPath;
    }

    public Movie(String movieName , Category category, ImageIcon image ){
        this.movieName = movieName;
        this.category = category;
        this.image = image;
    }







}
