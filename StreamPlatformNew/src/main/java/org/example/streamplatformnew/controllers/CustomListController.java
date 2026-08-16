package org.example.streamplatformnew.controllers;

import jakarta.persistence.Table;
import org.example.streamplatformnew.models.CustomList;
import org.example.streamplatformnew.models.Movie;
import org.example.streamplatformnew.services.CustomListService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lists")
@Table(name = "custom-list")
public class CustomListController {

    private final CustomListService customListService;

    public CustomListController(CustomListService customListService) {
        this.customListService = customListService;
    }

    @GetMapping
    public List<CustomList> getAllCustomList() {
        return customListService.getAllCustomLists();
    }

    @PostMapping("/{Listid}/movies/{movieid}")
    public void addMovieToList(@PathVariable Long Listid, @PathVariable Long movieid) {
        customListService.addMovieToList(Listid, movieid);
    }

    @DeleteMapping("/{Listid}/movie/{movieid}")
    public void deleteMovieFromList(@PathVariable Long Listid, @PathVariable Long movieid) {
        customListService.removeMovieFromList(Listid, movieid);
    }

    @PostMapping("/{name}/{description}")
    public void createList(@PathVariable String name, @PathVariable String description) {
        customListService.createList(name, description);
    }





}
