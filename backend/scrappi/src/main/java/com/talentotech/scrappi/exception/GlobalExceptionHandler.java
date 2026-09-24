package com.talentotech.scrappi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ex.getMessage());
    }

    // Reglas de negocio incumplidas (p. ej. marcar entrada con una jornada abierta): 409 con el motivo
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleConflict(IllegalStateException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ex.getMessage());
    }

}
