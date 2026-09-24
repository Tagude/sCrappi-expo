package com.talentotech.scrappi;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class ScrappiApplication {

    @PostConstruct
    public void init() {
        // la zona horaria de Colombia para todo el sistema
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
    }

    public static void main(String[] args) {
        SpringApplication.run(ScrappiApplication.class, args);
    }
}
