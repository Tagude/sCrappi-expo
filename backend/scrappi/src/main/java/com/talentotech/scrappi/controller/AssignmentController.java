package com.talentotech.scrappi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talentotech.scrappi.model.Assignment;
import com.talentotech.scrappi.service.AssignmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<Assignment> create(@RequestBody Assignment assignment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.create(assignment));
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> findAll() {
        return ResponseEntity.ok(assignmentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> findById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Assignment>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.findByUser(userId));
    }

    @GetMapping("/workstation/{workStationId}")
    public ResponseEntity<List<Assignment>> findByWorkStation(@PathVariable Long workStationId) {
        return ResponseEntity.ok(assignmentService.findByWorkStation(workStationId));
    }
}