package com.talentotech.scrappi.exception;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org. springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ex.getMessage());
    }

}
