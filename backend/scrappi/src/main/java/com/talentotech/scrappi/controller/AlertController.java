package com.talentotech.scrappi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.talentotech.scrappi.model.Alert;
import com.talentotech.scrappi.service.AlertService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<Alert> create(@RequestBody Alert alert) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.create(alert));
    }

    @GetMapping
    public ResponseEntity<List<Alert>> findAll() {
        return ResponseEntity.ok(alertService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> findById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(alertService.findByUser(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Alert> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }
}