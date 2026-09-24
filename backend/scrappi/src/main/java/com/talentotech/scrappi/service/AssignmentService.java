package com.talentotech.scrappi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.talentotech.scrappi.exception.ResourceNotFoundException;
import com.talentotech.scrappi.model.Assignment;
import com.talentotech.scrappi.model.User;
import com.talentotech.scrappi.model.WorkStation;
import com.talentotech.scrappi.repository.AssignmentRepository;
import com.talentotech.scrappi.repository.UserRepository;
import com.talentotech.scrappi.repository.WorkStationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final WorkStationRepository workStationRepository;

    public Assignment create(Assignment assignment) {
        Long userId = assignment.getUser().getId();
        Long workStationId = assignment.getWorkStation().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkStation workStation = workStationRepository.findById(workStationId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkStation not found"));

        if (assignmentRepository.existsByUserIdAndWorkStationIdAndStartDateAndEndDate(
                userId,
                workStationId,
                assignment.getStartDate(),
                assignment.getEndDate())) {
            throw new ResourceNotFoundException("Assignment already exists");
        }

        assignment.setUser(user);
        assignment.setWorkStation(workStation);

        return assignmentRepository.save(assignment);
    }

    public List<Assignment> findAll() {
        return assignmentRepository.findAll();
    }

    public Assignment findById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    public List<Assignment> findByUser(Long userId) {
        return assignmentRepository.findByUserId(userId);
    }

    public List<Assignment> findByWorkStation(Long workStationId) {
        return assignmentRepository.findByWorkStationId(workStationId);
    }
}