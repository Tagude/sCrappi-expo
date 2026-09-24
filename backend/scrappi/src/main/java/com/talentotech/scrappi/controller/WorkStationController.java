package com.talentotech.scrappi.controller;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talentotech.scrappi.model.WorkStation;
import com.talentotech.scrappi.service.WorkStationService;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/workstation")
@RequiredArgsConstructor
public class WorkStationController {
    
    private final WorkStationService workStationService;

    @PostMapping
    public WorkStation create(@RequestBody WorkStation workStation) {
        return workStationService.save(workStation);
    }

    @GetMapping
    public List<WorkStation> findAll() {
        return workStationService.findAll();
    }

    @GetMapping("/{id}")
    public WorkStation findById(@PathVariable Long id) {
        return workStationService.findById(id);
    }

}
