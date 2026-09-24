package com.talentotech.scrappi.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.talentotech.scrappi.exception.ResourceNotFoundException;
import com.talentotech.scrappi.model.WorkStation;
import com.talentotech.scrappi.repository.WorkStationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkStationService {
    private final WorkStationRepository workStationRepository;

    public WorkStation save(WorkStation workStation) {

        if (workStationRepository.existsByName(workStation.getName())) {
            throw new ResourceNotFoundException("WorkStation already exists");
        }

        return workStationRepository.save(workStation);
    }

    public List<WorkStation> findAll() {
        return workStationRepository.findAll();
    }

    public WorkStation findById(Long id) {
        return workStationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkStation not found"));
    }
}
