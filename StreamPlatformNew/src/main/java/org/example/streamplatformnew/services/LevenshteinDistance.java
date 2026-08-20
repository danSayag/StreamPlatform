package org.example.streamplatformnew.services;


import java.util.ArrayList;
import java.util.List;
import org.example.streamplatformnew.models.Movie;
import org.springframework.stereotype.Service;

@Service
public class LevenshteinDistance {

    public LevenshteinDistance() {
    }

    public List<Movie> searchMovies(List<Movie> moviesToSearch ,String query){

        if (query == null || query.isBlank()) {
            return new ArrayList<>();
        }

        List<Movie> movies = new ArrayList<>();
        String queryLowerCase = query.toLowerCase();
        int sizeOfQuery = queryLowerCase.length();

    
        for (Movie movie : moviesToSearch) {

            int[][] levArray = new int[movie.getMovieName().length() + 1][sizeOfQuery + 1];

            for(int i = 0 ; i < levArray.length; i++){
                levArray[i][0] = i;
            }
            for(int i = 0 ; i < levArray[0].length; i++){
                levArray[0][i] = i;
            }

            String movieName = movie.getMovieName().toLowerCase();
            int movieLength = movieName.length();

            for(int i = 0 ; i < movieLength ; i++){
                for(int j = 0 ; j < sizeOfQuery ; j++ ){
                    if(movieName.charAt(i) == queryLowerCase.charAt(j)){
                        levArray[i+1][j+1] = levArray[i][j];
                    }
                    else {
                        levArray[i+1][j+1] = 1 + min(levArray[i][j + 1],levArray[i + 1][j],levArray[i][j]);
                    }    
                }
            }
            int distance = levArray[movieLength][sizeOfQuery];

            double mf = 1.0 - ( (double)distance  / (double)max(movieLength , sizeOfQuery)); 

            if( mf >= 0.65){
                movies.add(movie);
            }
        }
        return movies;
    }


    public int min(int a ,int b , int c){
       int res = a;
    
       if(b < res) res = b;
       if(c < res) res = c;

       return res;
    }


    public int max(int a , int b){
        return a > b ? a : b ;
    }





    
}
