package com.collaborativenotes.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        // Log error and return generic 500 for now
        System.out.println("ERROR: " + e.getMessage());
        return ResponseEntity.status(500).body("Error occurred: " + e.getMessage());
    }
}