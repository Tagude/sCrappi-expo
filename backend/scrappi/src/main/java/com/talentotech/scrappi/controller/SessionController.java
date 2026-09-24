package com.talentotech.scrappi.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talentotech.scrappi.model.Session;
import com.talentotech.scrappi.service.SessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<List<Session>> findAll() {
        return ResponseEntity.ok(sessionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Session>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.findByUser(userId));
    }

    @PutMapping("/{id}/logout")
    public ResponseEntity<Session> logout(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.logoutSession(id));
    }
}
